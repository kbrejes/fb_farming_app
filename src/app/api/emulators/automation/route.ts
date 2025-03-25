import { NextResponse } from 'next/server';
import { AppiumService } from '@/services/automation/appium-service';
// import { AuthActions } from '@/services/automation/actions/auth-actions';
import { AppiumServiceMock } from '@/mocks/appium-service-mock';
import { AutomationScenarioParams, AutomationResult } from '@/types/automation';

// Используем мок сервиса вместо реального для демонстрации
const appiumService = AppiumServiceMock.getInstance();

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

    // Получаем экземпляр сервиса автоматизации
    const appiumService = AppiumService.getInstance();
    
    // Создаем сессию для эмулятора
    const sessionId = await appiumService.createSession(`emulator-${port}`);
    
    try {
      // TODO: Реализовать выполнение сценария
      // Здесь будет код для выполнения конкретного сценария
      
      return NextResponse.json({
        success: true,
        message: 'Сценарий успешно выполнен',
        sessionId,
        scenarioType,
        deviceId: `emulator-${port}`,
        accountId
      });
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