import { NextResponse } from 'next/server';
import { SmsActivateService } from '@/services/sms-activate';

// Получаем инстанс сервиса SMS активации
const smsService = SmsActivateService.getInstance();

// Маршрут для запроса SMS кода для конкретной активации
export async function GET(request: Request) {
  console.log('GET /api/sms/code - Запрос SMS кода');
  
  // Получаем ID активации из параметров запроса
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    console.error('Не указан ID активации');
    return NextResponse.json({ error: 'ID активации не указан' }, { status: 400 });
  }
  
  // Проверяем, что ID активации является числовым
  if (!/^\d+$/.test(id)) {
    console.error(`Невалидный формат ID активации: ${id}`);
    return NextResponse.json({ error: 'Неверный формат ID активации. ID должен быть числовым.' }, { status: 400 });
  }
  
  console.log(`Запрос SMS кода для активации ${id}`);
  
  try {
    // Запрашиваем установку статуса 1 (готов получить SMS) для данной активации
    const result = await smsService.setStatus(id, 1);
    console.log(`Результат запроса SMS кода: ${result}`);
    
    if (result === 'ACCESS_READY') {
      return NextResponse.json({ success: true, message: 'Запрос на получение SMS успешно отправлен' });
    } else if (result === 'WRONG_ACTIVATION_ID') {
      return NextResponse.json({ error: 'Неверный ID активации. Возможно, активация уже завершена или отменена.' }, { status: 400 });
    } else if (result === 'BAD_STATUS') {
      return NextResponse.json({ error: 'Неверный статус активации. Возможно, номер уже получил SMS или был отменен.' }, { status: 400 });
    } else {
      return NextResponse.json({ error: `Не удалось запросить SMS: ${result}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Ошибка при запросе SMS кода:', error);
    console.error('Стек ошибки:', error.stack);
    
    return NextResponse.json(
      { error: 'Ошибка при запросе SMS кода: ' + (error.message || String(error)) },
      { status: 500 }
    );
  }
} 