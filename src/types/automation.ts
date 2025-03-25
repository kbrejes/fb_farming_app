import { Browser, Element } from 'webdriverio';

/**
 * Типы сценариев автоматизации
 */
export type AutomationScenarioType = 
  | 'login'             // Вход в аккаунт
  | 'register'          // Регистрация нового аккаунта
  | 'browse_feed'       // Просмотр ленты новостей
  | 'add_friends'       // Добавление друзей
  | 'post_content'      // Публикация контента
  | 'message'           // Отправка сообщений
  | 'join_groups'       // Вступление в группы
  | 'like_posts'        // Лайки постов
  | 'comment_posts'     // Комментирование постов
  | 'update_profile'    // Обновление профиля
  | 'logout';           // Выход из аккаунта

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
  deviceId: string;          // ID устройства (например, emulator-5554)
  accountId?: string;        // ID аккаунта в базе данных
  scenarioType: AutomationScenarioType; // Тип сценария
  scenarioSettings?: AutomationScenarioSettings; // Настройки сценария
  
  // Авторизационные данные (для сценариев login/register)
  credentials?: {
    email?: string;
    phone?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    birthDate?: string; // В формате DD.MM.YYYY
  };
}

/**
 * Результат выполнения сценария
 */
export interface AutomationResult {
  success: boolean;
  scenarioType: AutomationScenarioType;
  executionTimeMs: number;
  error?: string;
  sessionId?: string;
  screenshots?: string[];
  deviceId: string;
  accountId?: string;
  actions?: {
    name: string;
    success: boolean;
    timeMs: number;
    error?: string;
  }[];
} 