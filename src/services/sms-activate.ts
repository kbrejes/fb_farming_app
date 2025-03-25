interface SmsActivateResponse {
  status: string;
  phone?: string;
  id?: string;
  code?: string;
  error?: string;
  balance?: string;
}

export class SmsActivateService {
  private static instance: SmsActivateService;
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://api.sms-activate.org/stubs/handler_api.php';

  private constructor() {
    // Жестко задаем ключ без использования переменных окружения
    this.apiKey = '25120A6663349f2d400981Ab112bd4fc';
    console.log('Ключ API:', this.apiKey);
    console.log('Длина ключа:', this.apiKey.length);
  }

  public static getInstance(): SmsActivateService {
    if (!SmsActivateService.instance) {
      SmsActivateService.instance = new SmsActivateService();
    }
    return SmsActivateService.instance;
  }

  private async makeRequest(action: string, params: Record<string, string> = {}): Promise<string> {
    // Максимально простой URL без лишнего кодирования
    const url = `${this.baseUrl}?api_key=${this.apiKey}&action=${action}`;
    
    // Полное логирование всех деталей запроса
    console.log('URL запроса (полный):', url);
    console.log('Параметры:', params);

    // Делаем самый простой GET запрос
    let response;
    try {
      response = await fetch(url);
      console.log('Статус ответа:', response.status);
      console.log('Заголовки ответа:', Object.fromEntries(response.headers.entries()));
    } catch (error) {
      console.error('Ошибка fetch:', error);
      throw error;
    }

    let text;
    try {
      text = await response.text();
      console.log('Тело ответа (сырое):', text);
    } catch (error) {
      console.error('Ошибка при получении текста:', error);
      throw error;
    }

    if (text === 'BAD_KEY') {
      throw new Error('Неверный API ключ');
    }

    return text;
  }

  async getBalance(): Promise<number> {
    try {
      const response = await this.makeRequest('getBalance');
      console.log('Получен ответ getBalance:', response);
      
      if (!response.startsWith('ACCESS_BALANCE')) {
        throw new Error('Невозможно получить баланс');
      }
      
      const balance = response.split(':')[1];
      return parseFloat(balance);
    } catch (error) {
      console.error('Ошибка getBalance:', error);
      throw error;
    }
  }

  async getNumber(service: string = 'fb'): Promise<{ id: string; phone: string }> {
    // Сначала проверяем баланс, чтобы убедиться, что ключ работает
    try {
      const balance = await this.getBalance();
      console.log('Текущий баланс:', balance);
    } catch (error) {
      console.error('Ошибка при проверке баланса:', error);
      throw error;
    }

    // Теперь запрашиваем номер с минимальными параметрами
    try {
      // Создаем простой URL без дополнительных параметров, кроме самых необходимых
      const url = `${this.baseUrl}?api_key=${this.apiKey}&action=getNumber&service=${service}`;
      console.log('URL прямого запроса номера:', url);
      
      const response = await fetch(url);
      const text = await response.text();
      console.log('Ответ API getNumber:', text);
      
      if (text === 'BAD_KEY') {
        throw new Error('Неверный API ключ');
      }
      
      if (text === 'NO_BALANCE') {
        throw new Error('Недостаточно средств на балансе');
      }
      
      if (text === 'NO_NUMBERS') {
        throw new Error('Нет доступных номеров');
      }
      
      if (!text.startsWith('ACCESS_NUMBER')) {
        throw new Error('Неизвестный ответ: ' + text);
      }
      
      const parts = text.split(':');
      const id = parts[1];
      const phone = parts[2];
      
      if (!id || !phone) {
        throw new Error('Неверный формат ответа');
      }
      
      return { id, phone };
    } catch (error) {
      console.error('Ошибка при получении номера:', error);
      throw error;
    }
  }

  async getCode(id: string): Promise<string> {
    const response = await this.makeRequest('getStatus', { id });
    if (!response.startsWith('STATUS_OK')) {
      throw new Error('Failed to get SMS code');
    }
    return response.split(':')[1];
  }

  async setStatus(id: string, status: number): Promise<void> {
    const response = await this.makeRequest('setStatus', { id, status: status.toString() });
    if (response !== 'ACCESS_READY' && response !== 'ACCESS_RETRY_GET' && response !== 'ACCESS_ACTIVATION') {
      throw new Error('Failed to set status');
    }
  }

  async getActiveActivations(): Promise<{ id: string; phone: string; status: string; timeLeft: string }[]> {
    try {
      // Создаем URL для запроса активных активаций
      const url = `${this.baseUrl}?api_key=${this.apiKey}&action=getActiveActivations`;
      console.log('URL запроса активных активаций:', url);
      
      const response = await fetch(url);
      const text = await response.text();
      console.log('Ответ API getActiveActivations:', text);
      
      // Если нет активаций или произошла ошибка, возвращаем пустой массив
      if (text === 'NO_ACTIVATIONS' || text === 'BAD_KEY' || text === 'ERROR_SQL') {
        return [];
      }
      
      try {
        // Если получен JSON, парсим его
        const data = JSON.parse(text);
        // Преобразуем объект с активациями в массив и форматируем для нашего компонента
        const activations = Object.entries(data).map(([id, activation]: [string, any]) => {
          const phone = activation.phone || 'Неизвестно';
          const status = this.mapStatus(activation.status || '1');
          const timeCreated = new Date(activation.time * 1000).toISOString();
          
          // Рассчитываем оставшееся время (обычно 20 минут от создания)
          const createdTime = new Date(activation.time * 1000);
          const expiryTime = new Date(createdTime.getTime() + 20 * 60 * 1000); // +20 минут
          const now = new Date();
          const diffMinutes = Math.floor((expiryTime.getTime() - now.getTime()) / (60 * 1000));
          const diffSeconds = Math.floor(((expiryTime.getTime() - now.getTime()) % (60 * 1000)) / 1000);
          const timeLeft = diffMinutes > 0 ? `${diffMinutes}:${diffSeconds.toString().padStart(2, '0')}` : '0:00';
          
          return {
            id,
            phone,
            status,
            timeLeft
          };
        });
        
        return activations;
      } catch (err) {
        console.error('Ошибка парсинга ответа:', err);
        return [];
      }
    } catch (error) {
      console.error('Ошибка getActiveActivations:', error);
      return [];
    }
  }

  // Преобразование статуса активации из числового кода в текстовое представление
  private mapStatus(status: string): string {
    switch (status) {
      case '1': return 'waiting';
      case '2': return 'waiting';
      case '3': return 'code_received';
      case '4': return 'finished';
      case '5': return 'canceled';
      case '6': return 'waiting';
      case '7': return 'waiting';
      case '8': return 'canceled';
      default: return 'waiting';
    }
  }
} 