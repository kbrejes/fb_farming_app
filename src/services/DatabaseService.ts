import { PrismaClient } from '@prisma/client';

class DatabaseService {
  private static instance: DatabaseService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Account methods
  async createAccount(data: {
    email: string;
    password: string;
    phoneNumber?: string;
  }) {
    return this.prisma.account.create({
      data,
    });
  }

  async getAccounts() {
    return this.prisma.account.findMany({
      include: {
        tasks: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
    });
  }

  async getAccount(id: string) {
    return this.prisma.account.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async updateAccount(id: string, data: {
    status?: string;
    farmingDay?: number;
    phoneNumber?: string;
  }) {
    return this.prisma.account.update({
      where: { id },
      data,
    });
  }

  // Task methods
  async createTask(data: {
    accountId: string;
    type: string;
    status?: string;
  }) {
    return this.prisma.task.create({
      data,
    });
  }

  async updateTask(id: string, data: {
    status?: string;
    result?: any;
  }) {
    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  // Proxy methods
  async createProxy(data: {
    host: string;
    port: number;
    username?: string;
    password?: string;
    type?: string;
  }) {
    return this.prisma.proxy.create({
      data,
    });
  }

  async getAvailableProxy() {
    return this.prisma.proxy.findFirst({
      where: {
        status: 'active',
      },
    });
  }

  async updateProxyStatus(id: string, status: string) {
    return this.prisma.proxy.update({
      where: { id },
      data: { status },
    });
  }

  // Emulator methods
  async createEmulator(data: {
    name: string;
    androidId: string;
    deviceId: string;
    port: number;
  }) {
    return this.prisma.emulatorConfig.create({
      data,
    });
  }

  async getAvailableEmulator() {
    return this.prisma.emulatorConfig.findFirst({
      where: {
        status: 'created',
      },
    });
  }

  async updateEmulatorStatus(id: string, status: string) {
    return this.prisma.emulatorConfig.update({
      where: { id },
      data: { status },
    });
  }
}

export default DatabaseService; 