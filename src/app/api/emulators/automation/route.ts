import { NextResponse } from 'next/server';
import { AppiumService } from '@/services/automation/appium-service';
// import { AuthActions } from '@/services/automation/actions/auth-actions';
import { AppiumServiceMock } from '@/mocks/appium-service-mock';
import { AutomationScenarioParams, AutomationResult } from '@/types/automation';

// Используем мок сервиса вместо реального для демонстрации
const USE_MOCK = true;
const appiumService = USE_MOCK 
  ? AppiumServiceMock.getInstance() 
  : AppiumService.getInstance();

/**
 * API-эндпоинт для запуска автоматизации на эмуляторе
 */
export async function POST(request: Request) {
  try {
    const { deviceId, scenarioType, accountId, port } = await request.json();

    if (!deviceId || !scenarioType) {
      return NextResponse.json(
        { error: 'Не указаны обязательные параметры' },
        { status: 400 }
      );
    }

    console.log(`Автоматизация: ${scenarioType} для устройства emulator-${port}`);

    // При использовании мока не нужно проверять реальный эмулятор
    if (!USE_MOCK) {
      // Проверяем, что эмулятор запущен
      const androidHome = process.env.ANDROID_HOME;
      if (!androidHome) {
        return NextResponse.json(
          { error: 'Переменная окружения ANDROID_HOME не установлена' },
          { status: 500 }
        );
      }

      const adbPath = `${androidHome}/platform-tools/adb`;
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      // Проверяем статус эмулятора
      const { stdout: devices } = await execAsync(`${adbPath} devices`);
      const isEmulatorRunning = devices.includes(`emulator-${port}`);

      if (!isEmulatorRunning) {
        return NextResponse.json(
          { error: 'Эмулятор не запущен' },
          { status: 400 }
        );
      }
    }

    // Создаем сессию для эмулятора
    const sessionId = await appiumService.createSession(`emulator-${port}`);
    
    try {
      // Имитируем выполнение действий автоматизации
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Имитируем результат выполнения сценария
      const result: AutomationResult = {
        success: true,
        message: `Сценарий "${scenarioType}" успешно выполнен`,
        scenarioType,
        deviceId: `emulator-${port}`,
        accountId: accountId || undefined,
        executionTimeMs: 2000,
        actions: [
          { name: 'Запуск приложения', success: true, timeMs: 500 },
          { name: 'Поиск элементов интерфейса', success: true, timeMs: 300 },
          { name: 'Ввод данных', success: true, timeMs: 600 },
          { name: 'Отправка формы', success: true, timeMs: 400 },
          { name: 'Проверка результата', success: true, timeMs: 200 },
        ]
      };
      
      return NextResponse.json(result);
    } finally {
      // Закрываем сессию
      await appiumService.closeSession(sessionId);
    }
  } catch (error) {
    console.error('Error in automation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Неизвестная ошибка' },
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