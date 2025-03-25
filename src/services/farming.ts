import { EmulatorService } from './emulator';
import { SmsActivateService } from './sms-activate';
import { FacebookService } from './facebook';
import type { Account } from '@/types';
import { PrismaClient } from '@prisma/client';

export class FarmingService {
  private static instance: FarmingService;
  private readonly emulator: EmulatorService;
  private readonly smsActivate: SmsActivateService;
  private readonly facebook: FacebookService;
  private readonly prisma: PrismaClient;

  private constructor() {
    this.emulator = EmulatorService.getInstance();
    this.smsActivate = SmsActivateService.getInstance();
    this.facebook = FacebookService.getInstance();
    this.prisma = new PrismaClient();
  }

  public static getInstance(): FarmingService {
    if (!FarmingService.instance) {
      FarmingService.instance = new FarmingService();
    }
    return FarmingService.instance;
  }

  async createAccount(name: string): Promise<Account> {
    try {
      // Создаем эмулятор
      const deviceId = `fb_${Date.now()}`;
      await this.emulator.createEmulator(deviceId);
      await this.emulator.startEmulator(deviceId);
      await this.emulator.waitForBoot();

      // Получаем номер телефона
      const { id: phoneId, phone } = await this.smsActivate.getNumber();

      // Создаем запись в базе данных
      const account = await this.prisma.account.create({
        data: {
          name,
          email: `${name.toLowerCase().replace(' ', '.')}${Date.now()}@gmail.com`,
          password: `FB${Date.now()}#`,
          phoneNumber: phone,
          deviceId,
          status: 'created',
        },
      });

      // Регистрируем аккаунт в Facebook
      await this.facebook.registerAccount(account, phone);

      // Ждем SMS-код
      const code = await this.smsActivate.getCode(phoneId);
      
      // TODO: Ввести код подтверждения
      
      // Обновляем статус
      await this.prisma.account.update({
        where: { id: account.id },
        data: { status: 'warming' },
      });

      return account;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  async executeDailyTasks(accountId: string): Promise<void> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) throw new Error('Account not found');

    try {
      // Запускаем эмулятор
      await this.emulator.startEmulator(account.deviceId || '');
      await this.emulator.waitForBoot();

      // Входим в аккаунт
      await this.facebook.login(account.email, account.password);

      // Выполняем задачи в зависимости от дня фарминга
      const tasks = this.getTasksForDay(account.farmingDay);
      
      for (const task of tasks) {
        await this.executeTask(account, task);
        await this.prisma.task.create({
          data: {
            type: task.type,
            status: 'completed',
            accountId: account.id,
            details: task.details,
          },
        });
      }

      // Обновляем статус аккаунта
      await this.prisma.account.update({
        where: { id: account.id },
        data: {
          farmingDay: account.farmingDay + 1,
          lastActivity: new Date(),
        },
      });
    } catch (error) {
      console.error('Error executing daily tasks:', error);
      throw error;
    }
  }

  private getTasksForDay(day: number): Array<{ type: string; details?: any }> {
    // Базовые ежедневные задачи
    const tasks = [
      { type: 'like', details: { count: 5 } },
      { type: 'watchVideo', details: { count: 3 } },
    ];

    // Дополнительные задачи в зависимости от дня
    if (day % 2 === 0) {
      tasks.push({ type: 'post', details: { withImage: true } });
    }

    if (day % 3 === 0) {
      tasks.push({ type: 'addFriend', details: { count: 5 } });
    }

    return tasks;
  }

  private async executeTask(account: Account, task: { type: string; details?: any }): Promise<void> {
    switch (task.type) {
      case 'post':
        await this.facebook.createPost(
          'Продаю новый iPhone! Пишите в личку.',
          task.details?.withImage ? `photos/${account.id}/1.jpg` : undefined
        );
        break;

      case 'addFriend':
        await this.facebook.addFriends(task.details?.count || 5);
        break;

      // TODO: Реализовать остальные типы задач

      default:
        console.warn(`Unknown task type: ${task.type}`);
    }
  }

  async stopFarming(accountId: string): Promise<void> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) throw new Error('Account not found');

    await this.facebook.close();
    await this.emulator.stopEmulator();

    await this.prisma.account.update({
      where: { id: accountId },
      data: { status: 'ready' },
    });
  }
} 