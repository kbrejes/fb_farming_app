import { NextResponse } from 'next/server';
import { AppiumService } from '@/services/automation/appium-service';
import { AuthActions } from '@/services/automation/actions/auth-actions';
import { AutomationScenarioParams, AutomationResult } from '@/types/automation';

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
    
    // Подключаемся к сервису Appium
    const appiumService = AppiumService.getInstance();
    
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
      
      // Получаем драйвер для сессии
      const driver = appiumService.getSession(sessionId);
      
      // Выполняем сценарий в зависимости от типа
      if (params.scenarioType === 'login') {
        // Проверяем наличие учетных данных
        if (!params.credentials?.email || !params.credentials?.password) {
          throw new Error('Для входа в аккаунт требуются email и пароль');
        }
        
        // Создаем экземпляр класса для действий авторизации
        const authActions = new AuthActions(driver);
        
        // Запускаем сценарий входа
        const actionStartTime = Date.now();
        await authActions.loginToFacebook(params.credentials.email, params.credentials.password);
        
        // Записываем результат действия
        result.actions?.push({
          name: 'loginToFacebook',
          success: true,
          timeMs: Date.now() - actionStartTime
        });
        
        // Помечаем весь сценарий как успешный
        result.success = true;
      } else if (params.scenarioType === 'register') {
        // Проверяем наличие учетных данных
        if (
          !params.credentials?.email ||
          !params.credentials?.password ||
          !params.credentials?.firstName ||
          !params.credentials?.lastName ||
          !params.credentials?.birthDate
        ) {
          throw new Error('Для регистрации аккаунта требуются все учетные данные');
        }
        
        // Создаем экземпляр класса для действий авторизации
        const authActions = new AuthActions(driver);
        
        // Запускаем сценарий регистрации
        const actionStartTime = Date.now();
        await authActions.registerFacebookAccount(
          params.credentials.firstName,
          params.credentials.lastName,
          params.credentials.email,
          params.credentials.password,
          params.credentials.birthDate
        );
        
        // Записываем результат действия
        result.actions?.push({
          name: 'registerFacebookAccount',
          success: true,
          timeMs: Date.now() - actionStartTime
        });
        
        // Помечаем весь сценарий как успешный
        result.success = true;
      } else if (params.scenarioType === 'logout') {
        // Создаем экземпляр класса для действий авторизации
        const authActions = new AuthActions(driver);
        
        // Запускаем сценарий выхода
        const actionStartTime = Date.now();
        await authActions.logoutFromFacebook();
        
        // Записываем результат действия
        result.actions?.push({
          name: 'logoutFromFacebook',
          success: true,
          timeMs: Date.now() - actionStartTime
        });
        
        // Помечаем весь сценарий как успешный
        result.success = true;
      } else {
        throw new Error(`Сценарий ${params.scenarioType} пока не реализован`);
      }
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
    // Получаем сервис Appium
    const appiumService = AppiumService.getInstance();
    
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
    // Получаем сервис Appium
    const appiumService = AppiumService.getInstance();
    
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