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
  private cachedActivations: { id: string; phone: string; status: string; timeLeft: string; code?: string | null; country?: string }[] = [];
  private lastCacheUpdate: number = 0;
  private cacheValidPeriod: number = 5000; // 5 секунд (было 10 секунд)

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

  // Список доступных стран с кодами
  getAvailableCountries(): Promise<{ id: string; name: string; count: number }[]> {
    return new Promise(async (resolve) => {
      try {
        const url = `${this.baseUrl}?api_key=${this.apiKey}&action=getCountries`;
        const response = await fetch(url);
        const text = await response.text();
        
        try {
          const data = JSON.parse(text);
          
          if (data && typeof data === 'object') {
            // Преобразуем объект стран в массив
            const countries = Object.entries(data).map(([id, country]: [string, any]) => ({
              id,
              name: country.eng || country.rus || 'Unknown',
              count: 0
            }));
            
            console.log(`Получено ${countries.length} стран`);
            resolve(countries);
            
            // После получения стран запрашиваем количество номеров
            this.getNumbersCount().then(counts => {
              // Асинхронно обновляем количество номеров для каждой страны
              console.log('Получены данные о доступных номерах по странам');
            }).catch(error => {
              console.error('Ошибка при получении количества номеров:', error);
            });
          } else {
            console.error('Неверный формат данных стран');
            resolve([]);
          }
        } catch (error) {
          console.error('Ошибка парсинга ответа getCountries:', error);
          resolve([]);
        }
      } catch (error) {
        console.error('Ошибка при получении списка стран:', error);
        resolve([]);
      }
    });
  }

  // Получение количества доступных номеров
  async getNumbersCount(): Promise<any> {
    try {
      const url = `${this.baseUrl}?api_key=${this.apiKey}&action=getNumbersStatus&country=all`;
      const response = await fetch(url);
      const text = await response.text();
      
      try {
        const data = JSON.parse(text);
        console.log('Данные о доступных номерах:', data);
        return data;
      } catch (error) {
        console.error('Ошибка парсинга ответа getNumbersStatus:', error);
        return {};
      }
    } catch (error) {
      console.error('Ошибка при получении количества номеров:', error);
      return {};
    }
  }

  // Получение номера из указанной страны
  async getNumber(service: string = 'fb', country: string = '0'): Promise<{ id: string; phone: string; status: string; timeLeft: string; country?: string }> {
    // Сначала проверяем баланс, чтобы убедиться, что ключ работает
    try {
      const balance = await this.getBalance();
      console.log('Текущий баланс SMS-активации:', balance);
      
      if (balance <= 0) {
        throw new Error('Недостаточно средств на балансе для получения номера');
      }
    } catch (error) {
      console.error('Ошибка при проверке баланса:', error);
      throw new Error('Не удалось проверить баланс перед получением номера');
    }

    // Запрашиваем номер для активации
    try {
      // Создаем URL для запроса номера с указанной страной
      const url = `${this.baseUrl}?api_key=${this.apiKey}&action=getNumber&service=${service}&country=${country}`;
      console.log('URL запроса номера:', url);
      
      const response = await fetch(url);
      const text = await response.text();
      console.log('Ответ API getNumber (сырой):', text);
      
      // Обрабатываем известные форматы ошибок
      if (text === 'BAD_KEY') {
        throw new Error('Неверный API ключ');
      }
      
      if (text === 'NO_BALANCE') {
        throw new Error('Недостаточно средств на балансе');
      }
      
      if (text === 'NO_NUMBERS') {
        throw new Error(`Нет доступных номеров для выбранной страны (код ${country})`);
      }
      
      // Проверяем формат корректного ответа ACCESS_NUMBER:id:phone
      if (!text.startsWith('ACCESS_NUMBER')) {
        throw new Error(`Неизвестный ответ от API: ${text}`);
      }
      
      const parts = text.split(':');
      
      if (parts.length < 3) {
        throw new Error(`Неверный формат ответа: ${text}`);
      }
      
      const id = parts[1];
      const phone = parts[2];
      
      // Проверяем валидность полученных данных
      if (!id || !phone || !/^\d+$/.test(id)) {
        throw new Error('Получены некорректные данные номера');
      }
      
      console.log(`Получен новый номер: ID=${id}, телефон=${phone}, страна=${country}`);
      
      // Создаем активацию в том же формате, что возвращают другие методы
      const now = new Date();
      const expiryTime = new Date(now.getTime() + 20 * 60 * 1000); // +20 минут
      const diffMinutes = Math.floor((expiryTime.getTime() - now.getTime()) / (60 * 1000));
      const diffSeconds = Math.floor(((expiryTime.getTime() - now.getTime()) % (60 * 1000)) / 1000);
      const timeLeft = `${diffMinutes}:${diffSeconds.toString().padStart(2, '0')}`;
      
      const activation = {
        id,
        phone,
        status: 'waiting',
        timeLeft,
        country
      };
      
      // Обновляем кеш активаций, добавляя новую
      this.cachedActivations.push(activation);
      this.lastCacheUpdate = Date.now();
      
      return activation;
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

  async setStatus(id: string, status: number): Promise<string> {
    try {
      // Проверяем, что ID является числовым
      if (!/^\d+$/.test(id)) {
        console.error(`Попытка установить статус для неверного ID: ${id}`);
        return `WRONG_ACTIVATION_ID`;
      }
      
      // Статус: 1 - готов получить SMS, 3 - отмена, 6 - подтвердить SMS получен, 8 - отмена активации
      const url = `${this.baseUrl}?api_key=${this.apiKey}&action=setStatus&id=${id}&status=${status}`;
      console.log(`Запрос на установку статуса ${status} для активации ${id}`);
      
      const response = await fetch(url);
      const text = await response.text();
      console.log(`Ответ API при установке статуса ${status} для активации ${id}:`, text);
      
      // Обрабатываем возможные ошибки и возвращаем текстовый ответ
      if (text.includes('WRONG_ACTIVATION_ID')) {
        console.error(`Неверный ID активации: ${id}`);
        return 'WRONG_ACTIVATION_ID';
      }
      
      if (text.includes('BAD_STATUS')) {
        console.error(`Неверный статус: ${status} для активации ${id}`);
        return 'BAD_STATUS';
      }
      
      if (text.includes('ACCESS_READY') || text.includes('ACCESS_RETRY_GET') || 
          text.includes('ACCESS_ACTIVATION') || text.includes('ACCESS_CANCEL')) {
        console.log(`Успешно установлен статус ${status} для активации ${id}`);
        return text;
      }
      
      // Если ответ не содержит известных форматов, логируем
      console.warn(`Неизвестный формат ответа при установке статуса: ${text}`);
      return text;
    } catch (error) {
      console.error(`Ошибка при установке статуса ${status} для активации ${id}:`, error);
      throw error;
    }
  }

  async getActiveActivations(): Promise<{ id: string; phone: string; status: string; timeLeft: string }[]> {
    try {
      // Проверяем кеш перед запросом к API
      const now = Date.now();
      if (this.cachedActivations.length > 0 && 
          now - this.lastCacheUpdate < this.cacheValidPeriod) {
        console.log('Используем кешированные активации', this.cachedActivations);
        return this.cachedActivations;
      }
      
      // Создаем URL для запроса активных активаций
      const url = `${this.baseUrl}?api_key=${this.apiKey}&action=getActiveActivations`;
      console.log('URL запроса активных активаций:', url);
      
      const response = await fetch(url);
      const text = await response.text();
      console.log('Ответ API getActiveActivations (сырой):', text);
      
      // Проверка на пустой ответ
      if (!text || text.trim() === '') {
        console.log('API вернул пустой ответ - возвращаем кеш или пустой массив');
        // Если есть кеш, возвращаем его вместо пустого массива
        if (this.cachedActivations.length > 0) {
          console.log('Возвращаем кешированные активации вместо пустого ответа', this.cachedActivations);
          return this.cachedActivations;
        }
        return [];
      }
      
      // Проверка на известные статусы ошибок
      if (text === 'NO_ACTIVATIONS' || text === 'BAD_KEY' || text === 'ERROR_SQL') {
        console.log('API вернул статус:', text, '- возвращаем кеш или пустой массив');
        // Также используем кеш при ошибках
        if (this.cachedActivations.length > 0) {
          console.log('Возвращаем кешированные активации при ошибке API', this.cachedActivations);
          return this.cachedActivations;
        }
        return [];
      }
      
      try {
        // Если текст начинается с { - парсим как JSON
        if (text.trim().startsWith('{')) {
          const data = JSON.parse(text);
          console.log('Распарсенные данные JSON:', data);
          
          if (!data || Object.keys(data).length === 0) {
            console.log('API вернул пустой объект JSON - возвращаем кеш или пустой массив');
            if (this.cachedActivations.length > 0) {
              return this.cachedActivations;
            }
            return [];
          }
          
          // Проверяем наличие вложенного массива активаций
          if (data.activeActivations && Array.isArray(data.activeActivations) && data.activeActivations.length > 0) {
            console.log('Найден массив активаций в JSON:', data.activeActivations.length);
            
            // Обрабатываем массив активаций
            const activations = data.activeActivations.map((activation: any) => {
              console.log(`Обработка активации из массива:`, activation);
              
              // Получаем ID и телефон из нового формата JSON
              const id = activation.activationId || '';
              const phone = activation.phoneNumber || '';
              const statusCode = activation.activationStatus || '1';
              
              // Проверяем валидность ID
              if (!id || !/^\d+$/.test(id)) {
                console.log(`Пропускаем активацию с невалидным ID: ${id}`);
                return null;
              }
              
              const status = this.mapStatus(statusCode);
              
              // Расчет оставшегося времени
              let timeLeft = '0:00';
              try {
                const activationTime = activation.activationTime || '';
                let createdTime: Date;
                
                if (activationTime && activationTime.includes('-')) {
                  // Если время в формате '2025-03-25 15:07:12'
                  createdTime = new Date(activationTime);
                } else {
                  // Иначе используем текущее время
                  createdTime = new Date();
                }
                
                console.log(`Время создания активации ${id}:`, createdTime);
                
                const expiryTime = new Date(createdTime.getTime() + 20 * 60 * 1000); // +20 минут
                const now = new Date();
                
                if (expiryTime > now) {
                  const diffMinutes = Math.floor((expiryTime.getTime() - now.getTime()) / (60 * 1000));
                  const diffSeconds = Math.floor(((expiryTime.getTime() - now.getTime()) % (60 * 1000)) / 1000);
                  timeLeft = `${diffMinutes}:${diffSeconds.toString().padStart(2, '0')}`;
                }
                
                console.log(`Оставшееся время для активации ${id}:`, timeLeft);
              } catch (err) {
                console.error(`Ошибка при расчете времени для активации ${id}:`, err);
              }
              
              return {
                id,
                phone,
                status,
                timeLeft,
                code: activation.smsCode || null
              };
            })
            .filter(Boolean); // Убираем null элементы
            
            console.log('Итоговый массив активаций из JSON:', activations);
            
            // Сохраняем результат в кеше
            if (activations.length > 0) {
              this.cachedActivations = activations;
              this.lastCacheUpdate = Date.now();
              console.log('Обновлен кеш активаций', this.cachedActivations);
            } else if (this.cachedActivations.length > 0) {
              console.log('Получен пустой результат, но есть кеш - возвращаем кеш', this.cachedActivations);
              return this.cachedActivations;
            }
            
            return activations;
          }
          
          // Стандартная обработка для случая, когда нет вложенного массива activeActivations
          // Преобразуем объект в массив активаций
          const activations = Object.entries(data)
            // Фильтруем только записи с числовыми ID (реальные активации)
            .filter(([id]) => {
              const isNumeric = /^\d+$/.test(id);
              if (!isNumeric) {
                console.log(`Пропускаем запись с нечисловым ID: ${id}`);
              }
              return isNumeric;
            })
            .map(([id, activation]: [string, any]) => {
              console.log(`Обработка активации ${id}:`, activation);
              
              const phone = activation.phone || 'Неизвестно';
              const status = this.mapStatus(activation.status || '1');
              
              let timeLeft = '0:00';
              try {
                // Расчет оставшегося времени (20 минут от создания)
                const time = activation.time ? Number(activation.time) : Date.now() / 1000;
                const createdTime = new Date(time * 1000);
                console.log(`Время создания активации ${id}:`, createdTime);
                
                const expiryTime = new Date(createdTime.getTime() + 20 * 60 * 1000); // +20 минут
                const now = new Date();
                console.log(`Текущее время:`, now, `Время истечения:`, expiryTime);
                
                if (expiryTime > now) {
                  const diffMinutes = Math.floor((expiryTime.getTime() - now.getTime()) / (60 * 1000));
                  const diffSeconds = Math.floor(((expiryTime.getTime() - now.getTime()) % (60 * 1000)) / 1000);
                  timeLeft = `${diffMinutes}:${diffSeconds.toString().padStart(2, '0')}`;
                }
                console.log(`Оставшееся время для активации ${id}:`, timeLeft);
              } catch (err) {
                console.error(`Ошибка при расчете времени для активации ${id}:`, err);
              }
              
              return {
                id,
                phone,
                status,
                timeLeft
              };
            });
          
          console.log('Итоговый массив активаций из JSON:', activations);
          
          // После успешной обработки обновляем кеш
          const result = activations;
          
          // Сохраняем результат в кеше только если получили непустой массив
          if (result.length > 0) {
            this.cachedActivations = result;
            this.lastCacheUpdate = Date.now();
            console.log('Обновлен кеш активаций', this.cachedActivations);
          } else if (this.cachedActivations.length > 0) {
            console.log('Получен пустой результат, но есть кеш - возвращаем кеш', this.cachedActivations);
            return this.cachedActivations;
          }
          
          return result;
        } 
        // Обработка простого текстового формата (ACCESS_ACTIVATION:id:phone:status)
        else if (text.startsWith('ACCESS_ACTIVATION')) {
          console.log('Ответ в формате ACCESS_ACTIVATION');
          const parts = text.split(':');
          if (parts.length >= 4) {
            const id = parts[1];
            
            // Проверяем, что ID числовой
            if (!/^\d+$/.test(id)) {
              console.log(`Пропускаем активацию с нечисловым ID: ${id}`);
              
              // Используем кеш, если он есть
              if (this.cachedActivations.length > 0) {
                console.log('Возвращаем кешированные активации вместо невалидного ID', this.cachedActivations);
                return this.cachedActivations;
              }
              
              return [];
            }
            
            const phone = parts[2];
            const statusCode = parts[3];
            
            const status = this.mapStatus(statusCode);
            const now = new Date();
            // По умолчанию 20 минут активации
            const expiryTime = new Date(now.getTime() + 20 * 60 * 1000);
            const diffMinutes = Math.floor((expiryTime.getTime() - now.getTime()) / (60 * 1000));
            const diffSeconds = Math.floor(((expiryTime.getTime() - now.getTime()) % (60 * 1000)) / 1000);
            const timeLeft = `${diffMinutes}:${diffSeconds.toString().padStart(2, '0')}`;
            
            const activation = {
              id,
              phone,
              status,
              timeLeft
            };
            
            console.log('Обработана активация из текста:', activation);
            
            // Кешируем результат
            this.cachedActivations = [activation];
            this.lastCacheUpdate = Date.now();
            console.log('Обновлен кеш активаций из текстового ответа', this.cachedActivations);
            
            return [activation];
          }
        }
        // Получаем активные активации с помощью отдельного запроса getNumbersStatus
        // Это может потребоваться, если обычный getActiveActivations не работает
        else if (text.includes('BAD_ACTION') || text.includes('ERROR_SQL')) {
          console.log('Пробуем запросить через getNumbersStatus');
          // Сначала получаем баланс, чтобы проверить работу API
          const balanceUrl = `${this.baseUrl}?api_key=${this.apiKey}&action=getBalance`;
          const balanceResponse = await fetch(balanceUrl);
          const balanceText = await balanceResponse.text();
          
          if (balanceText.startsWith('ACCESS_BALANCE')) {
            console.log('API ключ работает, запрашиваем статус активаций');
            // Запрашиваем активные номера через другой метод API
            const statusUrl = `${this.baseUrl}?api_key=${this.apiKey}&action=getNumbersStatus&country=0&operator=null`;
            const statusResponse = await fetch(statusUrl);
            const statusText = await statusResponse.text();
            console.log('Ответ getNumbersStatus:', statusText);
            
            // Если есть кеш, используем его при необходимости
            if (this.cachedActivations.length > 0) {
              console.log('У нас есть кеш, используем его для getNumbersStatus', this.cachedActivations);
              return this.cachedActivations;
            }
            
            try {
              // Если получили JSON, обрабатываем его
              const statusData = JSON.parse(statusText);
              const activations: any[] = [];
              
              if (statusData && typeof statusData === 'object') {
                for (const [service, count] of Object.entries(statusData)) {
                  if ((count as number) > 0) {
                    console.log(`Сервис ${service} имеет ${count} активных номеров`);
                  }
                }
              }
              
              // Если данных нет, но есть кеш - возвращаем кеш
              if (activations.length === 0 && this.cachedActivations.length > 0) {
                console.log('Нет активаций из getNumbersStatus, возвращаем кеш', this.cachedActivations);
                return this.cachedActivations;
              }
              
              return activations;
            } catch (e) {
              console.error('Ошибка при парсинге ответа getNumbersStatus:', e);
              
              // При ошибке возвращаем кеш
              if (this.cachedActivations.length > 0) {
                console.log('Ошибка парсинга getNumbersStatus, возвращаем кеш', this.cachedActivations);
                return this.cachedActivations;
              }
            }
          }
          
          // Если ничего не сработало, но есть кеш - используем его
          if (this.cachedActivations.length > 0) {
            console.log('Не удалось получить активации через getNumbersStatus, возвращаем кеш', this.cachedActivations);
            return this.cachedActivations;
          }
          
          return [];
        } 
        else {
          console.log('Неизвестный формат ответа, возвращаем пустой массив');
          return [];
        }
      } catch (err) {
        console.error('Ошибка парсинга ответа:', err);
        console.log('Оригинальный текст ответа:', text);
        
        // При ошибке парсинга также возвращаем кеш
        if (this.cachedActivations.length > 0) {
          console.log('Возвращаем кешированные активации при ошибке парсинга', this.cachedActivations);
          return this.cachedActivations;
        }
      }
      
      return [];
    } catch (error) {
      console.error('Ошибка getActiveActivations:', error);
      
      // При общей ошибке также возвращаем кеш
      if (this.cachedActivations.length > 0) {
        console.log('Возвращаем кешированные активации при общей ошибке', this.cachedActivations);
        return this.cachedActivations;
      }
      
      return [];
    }
  }

  // Метод для преобразования числовых статусов в строковые
  private mapStatus(status: string): string {
    switch (status) {
      case '0':
      case '1':
        return 'waiting';  // Ожидание SMS
      case '2':
      case '4':
        return 'code_received';  // SMS получен
      case '3':
      case '-1':
        return 'canceled';  // Отменено
      case '6':
      case '8':
        return 'finished';  // Завершено
      default:
        return 'unknown';  // Неизвестный статус
    }
  }

  // Метод для очистки кеша активаций
  clearCache(): void {
    console.log('Очистка кеша активаций');
    this.cachedActivations = [];
    this.lastCacheUpdate = 0;
  }
} 