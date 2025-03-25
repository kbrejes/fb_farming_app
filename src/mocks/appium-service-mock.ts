/**
 * Мок для сервиса Appium, используется для демонстрации работы интерфейса
 * без необходимости реального подключения к Appium
 */

// Имитация сессий
const mockSessions: Record<string, any> = {};

// Имитация результатов автоматизации для разных сценариев
const mockResults: Record<string, any> = {
  login: {
    success: true,
    message: 'Успешный вход в аккаунт',
    actions: [
      { name: 'launchFacebook', success: true, timeMs: 2500 },
      { name: 'findLoginField', success: true, timeMs: 800 },
      { name: 'enterEmail', success: true, timeMs: 1200 },
      { name: 'enterPassword', success: true, timeMs: 1000 },
      { name: 'clickLoginButton', success: true, timeMs: 500 },
      { name: 'waitForHomepage', success: true, timeMs: 3000 }
    ]
  },
  register: {
    success: true,
    message: 'Аккаунт успешно зарегистрирован',
    actions: [
      { name: 'launchFacebook', success: true, timeMs: 2500 },
      { name: 'clickCreateAccount', success: true, timeMs: 800 },
      { name: 'enterPersonalInfo', success: true, timeMs: 2500 },
      { name: 'selectBirthDate', success: true, timeMs: 1500 },
      { name: 'enterEmail', success: true, timeMs: 1000 },
      { name: 'enterPassword', success: true, timeMs: 1000 },
      { name: 'clickRegisterButton', success: true, timeMs: 500 },
      { name: 'confirmRegistration', success: true, timeMs: 3000 }
    ]
  },
  browse_feed: {
    success: true,
    message: 'Просмотр ленты завершен',
    actions: [
      { name: 'launchFacebook', success: true, timeMs: 2500 },
      { name: 'loginToAccount', success: true, timeMs: 3500 },
      { name: 'scrollFeed', success: true, timeMs: 5000 },
      { name: 'viewPosts', success: true, timeMs: 8000 },
      { name: 'interactWithContent', success: true, timeMs: 4000 }
    ]
  },
  like_posts: {
    success: true,
    message: 'Выполнено 5 лайков постов',
    actions: [
      { name: 'launchFacebook', success: true, timeMs: 2500 },
      { name: 'loginToAccount', success: true, timeMs: 3500 },
      { name: 'scrollFeed', success: true, timeMs: 2000 },
      { name: 'likePost1', success: true, timeMs: 1000 },
      { name: 'scrollFeed', success: true, timeMs: 1500 },
      { name: 'likePost2', success: true, timeMs: 1000 },
      { name: 'scrollFeed', success: true, timeMs: 1500 },
      { name: 'likePost3', success: true, timeMs: 1000 },
      { name: 'scrollFeed', success: true, timeMs: 1500 },
      { name: 'likePost4', success: true, timeMs: 1000 },
      { name: 'scrollFeed', success: true, timeMs: 1500 },
      { name: 'likePost5', success: true, timeMs: 1000 }
    ]
  },
  add_friends: {
    success: true,
    message: 'Добавлено 3 друга',
    actions: [
      { name: 'launchFacebook', success: true, timeMs: 2500 },
      { name: 'loginToAccount', success: true, timeMs: 3500 },
      { name: 'navigateToFriendSuggestions', success: true, timeMs: 2000 },
      { name: 'addFriend1', success: true, timeMs: 1500 },
      { name: 'addFriend2', success: true, timeMs: 1500 },
      { name: 'addFriend3', success: true, timeMs: 1500 },
      { name: 'confirmFriendRequests', success: true, timeMs: 2000 }
    ]
  },
  logout: {
    success: true,
    message: 'Выход из аккаунта выполнен',
    actions: [
      { name: 'openMenu', success: true, timeMs: 1000 },
      { name: 'scrollToLogout', success: true, timeMs: 1500 },
      { name: 'clickLogout', success: true, timeMs: 500 },
      { name: 'confirmLogout', success: true, timeMs: 1000 }
    ]
  }
};

// Имитирует создание случайных ошибок (в 20% случаев)
const randomError = () => {
  return Math.random() < 0.2;
};

// Имитирует задержку выполнения операций
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Мок-версия сервиса Appium для тестирования и разработки
 */
export class AppiumServiceMock {
  private static instance: AppiumServiceMock;
  private sessions: Map<string, any> = new Map();

  private constructor() {
    console.log('AppiumServiceMock инициализирован');
  }

  /**
   * Получает экземпляр сервиса (Singleton паттерн)
   */
  public static getInstance(): AppiumServiceMock {
    if (!AppiumServiceMock.instance) {
      AppiumServiceMock.instance = new AppiumServiceMock();
    }
    return AppiumServiceMock.instance;
  }

  /**
   * Создает мок-сессию и возвращает идентификатор
   * @param deviceId имя устройства (например, emulator-5554)
   */
  async createSession(deviceId: string): Promise<string> {
    console.log(`[MOCK] Создание сессии для устройства ${deviceId}`);
    
    const sessionId = `mock_session_${Date.now()}`;
    this.sessions.set(sessionId, {
      deviceId,
      createdAt: new Date().toISOString()
    });
    
    // Имитируем задержку сетевого запроса
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`[MOCK] Сессия ${sessionId} успешно создана`);
    return sessionId;
  }
  
  /**
   * Возвращает мок-сессию по ID
   * @param sessionId идентификатор сессии
   */
  getSession(sessionId: string): any {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`[MOCK] Сессия с ID ${sessionId} не найдена`);
    }
    return session;
  }
  
  /**
   * Имитирует закрытие сессии
   * @param sessionId идентификатор сессии
   */
  async closeSession(sessionId: string): Promise<void> {
    console.log(`[MOCK] Закрытие сессии ${sessionId}`);
    
    if (!this.sessions.has(sessionId)) {
      throw new Error(`[MOCK] Сессия с ID ${sessionId} не найдена`);
    }
    
    // Имитируем задержку сетевого запроса
    await new Promise(resolve => setTimeout(resolve, 300));
    
    this.sessions.delete(sessionId);
    console.log(`[MOCK] Сессия ${sessionId} успешно закрыта`);
  }

  /**
   * Возвращает список всех мок-сессий
   */
  getSessions(): string[] {
    return Array.from(this.sessions.keys());
  }

  /**
   * Имитирует закрытие всех сессий
   */
  async closeAllSessions(): Promise<void> {
    const sessionIds = this.getSessions();
    console.log(`[MOCK] Закрытие всех сессий (${sessionIds.length})`);
    
    // Имитируем задержку сетевого запроса
    await new Promise(resolve => setTimeout(resolve, 300));
    
    this.sessions.clear();
    console.log(`[MOCK] Все сессии успешно закрыты`);
  }

  async executeScenario(scenarioType: string): Promise<any> {
    console.log(`[MOCK] Выполнение сценария: ${scenarioType}`);
    
    // Имитация задержки выполнения сценария
    const executionTime = Math.floor(Math.random() * 5000) + 5000;
    await delay(executionTime);
    
    // Симуляция возможной ошибки
    if (randomError()) {
      throw new Error(`[MOCK] Ошибка при выполнении сценария ${scenarioType}`);
    }
    
    // Возвращаем мок результата сценария или дефолтный успешный результат
    return mockResults[scenarioType] || {
      success: true,
      message: `Сценарий ${scenarioType} успешно выполнен`,
      actions: [
        { name: 'defaultAction', success: true, timeMs: executionTime }
      ]
    };
  }
} 