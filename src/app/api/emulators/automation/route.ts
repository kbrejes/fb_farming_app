import { NextResponse } from 'next/server';
// import { AppiumService } from '@/services/automation/appium-service';
// import { AuthActions } from '@/services/automation/actions/auth-actions';
import { AppiumServiceMock } from '@/mocks/appium-service-mock';
import { AutomationScenarioParams, AutomationResult } from '@/types/automation';

// Используем мок сервиса вместо реального для демонстрации
const appiumService = AppiumServiceMock.getInstance();

/**
 * API-эндпоинт для запуска автоматизации на эмуляторе
 */
export async function POST(request: Request) {
  console.log('POST /api/emulators/automation - Запуск автоматизации');
  
  try {
    // Парсим параметры запроса
    const params: AutomationScenarioParams = await request.json();
    console.log('Параметры автоматизации:', params);
    
    // Проверяем наличие обязательных параметров
    if (!params.deviceId || !params.scenarioType) {
      return NextResponse.json(
        { error: 'Требуются параметры deviceId и scenarioType' },
        { status: 400 }
      );
    }
    
    // Результат автоматизации
    const result: AutomationResult = {
      success: false,
      scenarioType: params.scenarioType,
      executionTimeMs: 0,
      deviceId: params.deviceId,
      accountId: params.accountId,
      actions: []
    };
    
    const startTime = Date.now();
    let sessionId: string | undefined;
    
    try {
      // Создаем новую сессию Appium
      sessionId = await appiumService.createSession(params.deviceId);
      result.sessionId = sessionId;
      
      // Выполняем сценарий
      const scenarioResult = await appiumService.executeScenario(params.scenarioType);
      
      // Обновляем результат
      result.success = scenarioResult.success;
      result.actions = scenarioResult.actions;
      
      console.log(`Сценарий ${params.scenarioType} выполнен успешно`);
    } catch (error: any) {
      console.error('Ошибка при выполнении автоматизации:', error);
      
      // Записываем ошибку в результат
      result.success = false;
      result.error = error.message || String(error);
    } finally {
      // Вычисляем общее время выполнения
      result.executionTimeMs = Date.now() - startTime;
      
      // Закрываем сессию Appium
      if (sessionId) {
        try {
          await appiumService.closeSession(sessionId);
        } catch (error) {
          console.error('Ошибка при закрытии сессии Appium:', error);
        }
      }
    }
    
    // Возвращаем результат выполнения автоматизации
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Ошибка при обработке запроса:', error);
    
    return NextResponse.json(
      { error: `Ошибка при запуске автоматизации: ${error.message || String(error)}` },
      { status: 500 }
    );
  }
}

/**
 * API-эндпоинт для получения списка активных сессий
 */
export async function GET(request: Request) {
  console.log('GET /api/emulators/automation - Получение списка активных сессий');
  
  try {
    // Получаем список активных сессий
    const sessions = appiumService.getSessions();
    
    return NextResponse.json({
      sessions,
      count: sessions.length
    });
  } catch (error: any) {
    console.error('Ошибка при получении списка сессий:', error);
    
    return NextResponse.json(
      { error: `Ошибка при получении списка сессий: ${error.message || String(error)}` },
      { status: 500 }
    );
  }
}

/**
 * API-эндпоинт для закрытия всех активных сессий
 */
export async function DELETE(request: Request) {
  console.log('DELETE /api/emulators/automation - Закрытие всех активных сессий');
  
  try {
    // Закрываем все активные сессии
    await appiumService.closeAllSessions();
    
    return NextResponse.json({
      success: true,
      message: 'Все активные сессии закрыты'
    });
  } catch (error: any) {
    console.error('Ошибка при закрытии сессий:', error);
    
    return NextResponse.json(
      { error: `Ошибка при закрытии сессий: ${error.message || String(error)}` },
      { status: 500 }
    );
  }
} 