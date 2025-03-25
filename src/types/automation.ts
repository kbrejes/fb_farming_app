import { Browser, Element } from 'webdriverio';

/**
 * Типы сценариев автоматизации
 */
export enum AutomationScenarioType {
  LOGIN = 'login',
  REGISTER = 'register',
  BROWSE_FEED = 'browse_feed',
  LIKE_POSTS = 'like_posts',
  ADD_FRIENDS = 'add_friends',
  LOGOUT = 'logout'
}

/**
 * Настройки сценария автоматизации
 */
export interface AutomationScenarioSettings {
  // Общие настройки
  timeoutMs?: number;         // Таймаут выполнения сценария
  retries?: number;           // Количество попыток при ошибке
  randomizeActions?: boolean; // Рандомизировать действия
  
  // Настройки для разных типов сценариев
  login?: {
    rememberCredentials?: boolean;
  };
  
  register?: {
    useRandomName?: boolean;
    useRandomBirthDate?: boolean;
  };
  
  browseFeed?: {
    scrollCount?: number;    // Количество прокруток ленты
    minScrollTime?: number;  // Минимальное время на прокрутку
    maxScrollTime?: number;  // Максимальное время на прокрутку
    pauseBetweenScrolls?: number; // Пауза между прокрутками
  };
  
  addFriends?: {
    maxFriendsToAdd?: number;
  };
  
  postContent?: {
    contentType?: 'text' | 'image' | 'video';
    text?: string;
    mediaPath?: string;
  };
  
  likePostsSettings?: {
    minLikes?: number;
    maxLikes?: number;
  };
  
  commentPostsSettings?: {
    minComments?: number;
    maxComments?: number;
    comments?: string[];
  };
}

/**
 * Параметры сценария автоматизации
 */
export interface AutomationScenarioParams {
  /** Тип сценария */
  scenarioType: string;
  /** ID устройства */
  deviceId: string;
  /** ID аккаунта (опционально) */
  accountId?: string;
  /** Порт эмулятора */
  port: number;
}

/**
 * Информация о выполненном действии
 */
export interface ActionResult {
  /** Название действия */
  name: string;
  /** Успешно ли выполнено */
  success: boolean;
  /** Время выполнения (мс) */
  timeMs: number;
  /** Ошибка (если есть) */
  error?: string;
}

/**
 * Результат выполнения сценария автоматизации
 */
export interface AutomationResult {
  /** Успешно ли выполнен сценарий */
  success: boolean;
  /** Сообщение о результате */
  message: string;
  /** Тип сценария */
  scenarioType: string;
  /** ID устройства */
  deviceId: string;
  /** ID аккаунта (опционально) */
  accountId?: string;
  /** Время выполнения (мс) */
  executionTimeMs: number;
  /** Список выполненных действий */
  actions: ActionResult[];
  /** Ошибка (если есть) */
  error?: string;
} 