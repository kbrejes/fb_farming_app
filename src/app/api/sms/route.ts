import { NextResponse } from 'next/server';
import { SmsActivateService } from '@/services/sms-activate';

// Используем Singleton паттерн
const smsService = SmsActivateService.getInstance();

export async function GET(request: Request) {
  console.log('GET /api/sms - Получение активных активаций');
  
  try {
    // Получаем параметры запроса
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('force') === '1';
    
    if (forceRefresh) {
      console.log('Принудительное обновление данных без кеша');
      smsService.clearCache();
    }
    
    // Проверяем работу API, запрашивая баланс
    try {
      const balance = await smsService.getBalance();
      console.log('Баланс аккаунта SMS-активации:', balance);
    } catch (balanceError) {
      console.error('Ошибка при проверке баланса:', balanceError);
      // Если баланс не получен, все равно пытаемся получить активации
    }
    
    // Добавляем задержку для более стабильного ответа API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Вызов smsService.getActiveActivations()');
    const activations = await smsService.getActiveActivations();
    console.log(`Получены активации: ${activations.length}`, JSON.stringify(activations, null, 2));
    
    // Если не получили ни одной активации, попробуем еще раз
    if (activations.length === 0) {
      console.log('Первая попытка не вернула активаций, пробуем повторно...');
      
      // Добавляем задержку перед второй попыткой
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Вторая попытка
      const secondAttemptActivations = await smsService.getActiveActivations();
      console.log(`Вторая попытка: получено активаций: ${secondAttemptActivations.length}`);
      
      // Если вторая попытка успешна, используем ее результат
      if (secondAttemptActivations.length > 0) {
        console.log('Вторая попытка успешна, используем эти данные');
        
        // Фильтруем активации с невалидными ID
        const validActivations = secondAttemptActivations.filter(activation => {
          const isValid = /^\d+$/.test(activation.id);
          if (!isValid) {
            console.log(`Фильтруем активацию с невалидным ID: ${activation.id}`);
          }
          return isValid;
        });
        
        return NextResponse.json({ activeActivations: validActivations }, { status: 200 });
      }
    }
    
    // Фильтруем активации с невалидными ID
    const validActivations = activations.filter(activation => {
      const isValid = /^\d+$/.test(activation.id);
      if (!isValid) {
        console.log(`Фильтруем активацию с невалидным ID: ${activation.id}`);
      }
      return isValid;
    });
    
    console.log(`Отфильтровано валидных активаций: ${validActivations.length}`);
    
    return NextResponse.json({ activeActivations: validActivations }, { status: 200 });
  } catch (error: any) {
    console.error('Ошибка при получении активных активаций:', error);
    console.error('Стек ошибки:', error.stack);
    
    return NextResponse.json(
      { error: 'Ошибка при получении активных активаций: ' + (error.message || String(error)), activeActivations: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log('API роут: начало выполнения POST запроса');
  
  try {
    // Проверка баланса, если недостаточно средств, сразу возвращаем ошибку
    console.log('API роут: проверка баланса...');
    try {
      const balance = await smsService.getBalance();
      console.log('API роут: баланс получен успешно:', balance);
      
      if (balance < 0.20) { // Минимальный баланс для активации (20 центов)
        console.log('API роут: недостаточно средств для активации. Баланс:', balance);
        return NextResponse.json(
          { error: `Недостаточно средств на балансе. Текущий баланс: ${balance}$. Требуется минимум 0.20$` },
          { status: 400 }
        );
      }
    } catch (balanceError) {
      console.error('API роут: ошибка при проверке баланса:', balanceError);
      // Продолжаем выполнение даже при ошибке проверки баланса
    }
    
    // Получаем параметры запроса
    const data = await request.json();
    const service = data.service || 'fb';
    
    // Запрашиваем номер
    console.log('API роут: запрос номера...');
    const numberData = await smsService.getNumber(service);
    
    console.log('API роут: номер успешно получен:', numberData);
    
    return NextResponse.json(numberData);
  } catch (error: any) {
    console.error('API роут: ошибка при получении номера:', error);
    
    // Специальная обработка для ошибки недостаточного баланса
    if (error.message && error.message.includes('Недостаточно средств')) {
      return NextResponse.json(
        { error: 'Недостаточно средств на балансе для получения номера. Пожалуйста, пополните баланс.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Ошибка при получении номера' },
      { status: 500 }
    );
  }
} 