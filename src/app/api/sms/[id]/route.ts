import { NextResponse } from 'next/server';
import { SmsActivateService } from '@/services/sms-activate';

// Константы для статусов активации
const STATUS_CANCEL = 8; // Отмена
const STATUS_READY = 6;  // Готов получить SMS

const smsService = SmsActivateService.getInstance();

// Получение статуса активации
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('API роут: GET запрос для получения статуса активации', params.id);
    
    // Здесь должен быть запрос статуса, но пока просто проверяем активные активации
    const activations = await smsService.getActiveActivations();
    const activation = activations.find(a => a.id === params.id);
    
    if (!activation) {
      return NextResponse.json({ error: 'Активация не найдена' }, { status: 404 });
    }
    
    return NextResponse.json(activation);
  } catch (error) {
    console.error('API роут: ошибка при получении статуса активации:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ошибка при получении статуса' },
      { status: 500 }
    );
  }
}

// Изменение статуса активации (отмена, подтверждение и т.д.)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { action } = await request.json();
    console.log('API роут: PATCH запрос для активации', params.id, 'с действием', action);
    
    if (action === 'cancel') {
      // Отмена активации
      await smsService.setStatus(params.id, STATUS_CANCEL);
      return NextResponse.json({ success: true, status: 'canceled' });
    }
    
    if (action === 'ready') {
      // Говорим, что мы готовы получить SMS
      await smsService.setStatus(params.id, STATUS_READY);
      return NextResponse.json({ success: true, status: 'waiting' });
    }
    
    return NextResponse.json({ error: 'Неизвестное действие' }, { status: 400 });
  } catch (error) {
    console.error('API роут: ошибка при изменении статуса активации:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ошибка при изменении статуса' },
      { status: 500 }
    );
  }
}

// Удаление активации
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('API роут: DELETE запрос для активации', params.id);
    
    // Отмена активации
    await smsService.setStatus(params.id, STATUS_CANCEL);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API роут: ошибка при удалении активации:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ошибка при удалении активации' },
      { status: 500 }
    );
  }
} 