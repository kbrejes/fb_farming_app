export interface SmsActivateConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface GetBalanceResponse {
  status: string;
  balance: string;
}

export interface GetNumberResponse {
  status: string;
  phone: string;
  id: string;
  timeRegister: string;
  timeLeft: string;
  service: string;
  country: string;
}

export interface GetStatusResponse {
  status: string;
  code?: string;
  message?: string;
}

export interface ActivationStatus {
  id: string;
  phone: string;
  status: 'waiting' | 'code_received' | 'finished' | 'canceled';
  code?: string;
  timeCreated: string;
  timeLeft: string;
}

export interface GetActiveActivationsResponse {
  status: string;
  activeActivations: ActivationStatus[];
}

export enum SmsActivateStatus {
  STATUS_WAIT_CODE = 1,      // Ожидание смс
  STATUS_WAIT_RETRY = 2,     // Ожидание уточнения кода
  STATUS_WAIT_RESEND = 3,    // Ожидание повторной отправки
  STATUS_CANCEL = 8,         // Отмена активации
  STATUS_OK = 6,            // Код получен
  ACCESS_ACTIVATION = 'ACCESS_ACTIVATION',
  ACCESS_CANCEL = 'ACCESS_CANCEL',
  ERROR_NO_NUMBERS = 'NO_NUMBERS',
} 