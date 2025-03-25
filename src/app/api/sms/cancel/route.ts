import { NextResponse } from 'next/server';
import { SmsActivateService } from '@/services/sms-activate';

// Получаем инстанс сервиса SMS активации
const smsService = SmsActivateService.getInstance();

// Маршрут для отмены активации
export async function GET(request: Request) {
  console.log('GET /api/sms/cancel - Отмена активации');
  
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
  
  console.log(`Отмена активации ${id}`);
  
  try {
    // Устанавливаем статус 8 (отмена активации)
    const result = await smsService.setStatus(id, 8);
    console.log(`Результат отмены активации: ${result}`);
    
    if (result === 'ACCESS_CANCEL') {
      return NextResponse.json({ success: true, message: 'Активация успешно отменена' });
    } else if (result === 'WRONG_ACTIVATION_ID') {
      return NextResponse.json({ error: 'Неверный ID активации. Возможно, активация уже завершена или отменена.' }, { status: 400 });
    } else {
      return NextResponse.json({ error: `Не удалось отменить активацию: ${result}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Ошибка при отмене активации:', error);
    console.error('Стек ошибки:', error.stack);
    
    return NextResponse.json(
      { error: 'Ошибка при отмене активации: ' + (error.message || String(error)) },
      { status: 500 }
    );
  }
} 