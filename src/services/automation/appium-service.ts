import { remote } from 'webdriverio';

// Паттерн Singleton для единой точки управления Appium
export class AppiumService {
  private static instance: AppiumService;
  private sessions: Map<string, WebdriverIO.Browser> = new Map();

  private constructor() {
    console.log('AppiumService инициализирован');
  }

  /**
   * Получает экземпляр сервиса (Singleton паттерн)
   */
  public static getInstance(): AppiumService {
    if (!AppiumService.instance) {
      AppiumService.instance = new AppiumService();
    }
    return AppiumService.instance;
  }

  /**
   * Создает сессию Appium и возвращает идентификатор
   * @param deviceId имя устройства (например, emulator-5554)
   */
  async createSession(deviceId: string): Promise<string> {
    try {
      console.log(`Создание сессии для устройства ${deviceId}`);
      
      const browser = await remote({
        path: '/wd/hub',
        port: 4723,
        capabilities: {
          platformName: 'Android',
          'appium:deviceName': deviceId,
          'appium:automationName': 'UiAutomator2',
          'appium:noReset': false
        }
      });
      
      const sessionId = `session_${Date.now()}`;
      this.sessions.set(sessionId, browser);
      console.log(`Сессия ${sessionId} успешно создана`);
      return sessionId;
    } catch (error: any) {
      console.error('Ошибка при создании сессии Appium:', error);
      throw new Error(`Не удалось создать сессию: ${error.message}`);
    }
  }
  
  /**
   * Получает сессию по ID
   * @param sessionId идентификатор сессии
   */
  getSession(sessionId: string): WebdriverIO.Browser {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Сессия с ID ${sessionId} не найдена`);
    }
    return session;
  }
  
  /**
   * Закрывает сессию
   * @param sessionId идентификатор сессии
   */
  async closeSession(sessionId: string): Promise<void> {
    try {
      const session = this.getSession(sessionId);
      await session.deleteSession();
      this.sessions.delete(sessionId);
      console.log(`Сессия ${sessionId} успешно закрыта`);
    } catch (error: any) {
      console.error(`Ошибка при закрытии сессии ${sessionId}:`, error);
      throw new Error(`Не удалось закрыть сессию: ${error.message}`);
    }
  }

  /**
   * Получает список всех сессий
   */
  getSessions(): string[] {
    return Array.from(this.sessions.keys());
  }

  /**
   * Закрывает все сессии
   */
  async closeAllSessions(): Promise<void> {
    const sessionIds = this.getSessions();
    console.log(`Закрытие всех сессий (${sessionIds.length})`);
    
    for (const sessionId of sessionIds) {
      try {
        await this.closeSession(sessionId);
      } catch (error) {
        console.error(`Ошибка при закрытии сессии ${sessionId}:`, error);
      }
    }
  }
} 