import { NextResponse } from 'next/server';
import { SmsActivateService } from '@/services/sms-activate';

// Используем Singleton паттерн
const smsService = SmsActivateService.getInstance();

export async function GET() {
  console.log('API роут: GET запрос для получения активных активаций');
  
  try {
    // Получаем активные активации
    const activations = await smsService.getActiveActivations();
    console.log('API роут: Получено активаций:', activations.length);
    
    return NextResponse.json({ activeActivations: activations });
  } catch (error) {
    console.error('API роут: ошибка при получении активаций:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ошибка при получении активаций', activeActivations: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log('API роут: начало выполнения POST запроса');
  
  try {
    console.log('API роут: проверка баланса...');
    // Сначала проверим, работает ли API ключ, запросив баланс
    try {
      const balance = await smsService.getBalance();
      console.log('API роут: баланс получен успешно:', balance);
    } catch (error) {
      console.error('API роут: ошибка при получении баланса:', error);
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      return NextResponse.json({ error: 'Не удалось получить баланс' }, { status: 500 });
    }

    // Теперь запрашиваем номер
    console.log('API роут: запрос номера...');
    const response = await smsService.getNumber('fb');
    console.log('API роут: номер получен успешно:', response);
    
    return NextResponse.json({
      id: response.id,
      phone: response.phone,
      status: 'waiting',
      timeLeft: '20:00'
    });
  } catch (error) {
    console.error('API роут: ошибка при получении номера:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    
    // Разные статусы в зависимости от ошибки
    if (errorMessage.includes('Неверный API ключ')) {
      return NextResponse.json({ error: errorMessage }, { status: 401 });
    }
    if (errorMessage.includes('Недостаточно средств')) {
      return NextResponse.json({ error: errorMessage }, { status: 402 });
    }
    if (errorMessage.includes('Нет доступных номеров')) {
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 