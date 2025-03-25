import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class EmulatorService {
  private static instance: EmulatorService;
  private isEmulatorRunning: boolean = false;

  private constructor() {}

  public static getInstance(): EmulatorService {
    if (!EmulatorService.instance) {
      EmulatorService.instance = new EmulatorService();
    }
    return EmulatorService.instance;
  }

  async createEmulator(name: string, deviceId: string = 'pixel_6'): Promise<void> {
    try {
      // Создаем новый эмулятор с заданными параметрами
      await execAsync(`avdmanager create avd -n ${name} -k "system-images;android-33;google_apis;x86_64" -d ${deviceId}`);
      
      // Настраиваем параметры эмулятора
      const config = [
        'hw.lcd.density=440',
        'hw.keyboard=yes',
        'disk.dataPartition.size=6G',
        'hw.ramSize=4096',
      ];

      // Записываем конфигурацию в файл
      for (const setting of config) {
        await execAsync(`echo ${setting} >> ~/.android/avd/${name}.avd/config.ini`);
      }
    } catch (error) {
      console.error('Error creating emulator:', error);
      throw new Error('Failed to create Android emulator');
    }
  }

  async startEmulator(name: string): Promise<void> {
    if (this.isEmulatorRunning) {
      console.log('Emulator is already running');
      return;
    }

    try {
      // Запускаем эмулятор в фоновом режиме
      const process = exec(`emulator -avd ${name} -no-snapshot-load`);
      
      // Ждем запуска эмулятора
      await new Promise((resolve) => setTimeout(resolve, 10000));
      
      this.isEmulatorRunning = true;

      // Обработка ошибок
      process.stderr?.on('data', (data) => {
        console.error('Emulator error:', data);
      });

      process.on('close', (code) => {
        console.log('Emulator process closed with code:', code);
        this.isEmulatorRunning = false;
      });
    } catch (error) {
      console.error('Error starting emulator:', error);
      throw new Error('Failed to start Android emulator');
    }
  }

  async stopEmulator(): Promise<void> {
    if (!this.isEmulatorRunning) {
      return;
    }

    try {
      await execAsync('adb emu kill');
      this.isEmulatorRunning = false;
    } catch (error) {
      console.error('Error stopping emulator:', error);
      throw new Error('Failed to stop Android emulator');
    }
  }

  async isEmulatorBooted(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('adb shell getprop sys.boot_completed');
      return stdout.trim() === '1';
    } catch {
      return false;
    }
  }

  async waitForBoot(): Promise<void> {
    let attempts = 0;
    const maxAttempts = 30;
    const interval = 2000;

    while (attempts < maxAttempts) {
      if (await this.isEmulatorBooted()) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
      attempts++;
    }

    throw new Error('Emulator boot timeout');
  }

  async installApk(apkPath: string): Promise<void> {
    try {
      await execAsync(`adb install ${apkPath}`);
    } catch (error) {
      console.error('Error installing APK:', error);
      throw new Error('Failed to install APK');
    }
  }
} 