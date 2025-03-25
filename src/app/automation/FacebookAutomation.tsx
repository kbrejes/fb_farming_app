'use client';

import { useState, useEffect } from 'react';
import { Emulator } from '@/types/emulator';
import EmulatorSelector from '@/components/automation/EmulatorSelector';

// Типы сценариев
const SCENARIOS = [
  { id: 'login', name: 'Вход в аккаунт' },
  { id: 'register', name: 'Регистрация нового аккаунта' },
  { id: 'browse_feed', name: 'Просмотр ленты' },
  { id: 'like_posts', name: 'Лайки постов' },
  { id: 'add_friends', name: 'Добавление друзей' },
  { id: 'logout', name: 'Выход из аккаунта' },
];

// Мок-данные аккаунтов для демонстрации
const ACCOUNTS = [
  { id: '1', email: 'test1@example.com', name: 'Тестовый аккаунт 1' },
  { id: '2', email: 'test2@example.com', name: 'Тестовый аккаунт 2' },
  { id: '3', email: 'test3@example.com', name: 'Тестовый аккаунт 3' },
];

interface ExecutionResult {
  success: boolean;
  message: string;
  scenarioType: string;
  deviceId: string;
  accountId?: string;
  executionTimeMs: number;
  actions: Array<{
    name: string;
    success: boolean;
    timeMs: number;
  }>;
  error?: string;
}

// Компонент для отображения экрана эмулятора
function EmulatorScreen({ running, scenarioType, currentAction }: { 
  running: boolean;
  scenarioType: string;
  currentAction?: string;
}) {
  const [screenUrl, setScreenUrl] = useState('/images/emulator_screens/home.png');
  
  useEffect(() => {
    if (running) {
      if (scenarioType === 'login') {
        setScreenUrl('/images/emulator_screens/login.png');
      } else if (scenarioType === 'register') {
        setScreenUrl('/images/emulator_screens/register.png');
      } else if (scenarioType === 'browse_feed') {
        setScreenUrl('/images/emulator_screens/feed.png');
      } else {
        setScreenUrl('/images/emulator_screens/default.png');
      }
    } else {
      setScreenUrl('/images/emulator_screens/home.png');
    }
  }, [running, scenarioType, currentAction]);

  return (
    <div style={{ 
      border: '8px solid #222', 
      borderRadius: '16px', 
      overflow: 'hidden',
      width: '300px',
      height: '600px',
      position: 'relative',
      backgroundColor: '#000'
    }}>
      <div style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '20px',
        backgroundColor: '#111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          width: '60px', 
          height: '10px', 
          backgroundColor: '#222',
          borderRadius: '5px'
        }} />
      </div>
      
      {/* Тело эмулятора */}
      <div style={{ 
        padding: '30px 10px 10px 10px',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Экран - здесь в реальном приложении можно показывать скриншоты с эмулятора */}
        <div style={{ 
          flex: 1,
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          {running ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <div style={{ 
                  fontSize: '12px',
                  color: '#333',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  position: 'absolute',
                  top: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10
                }}>
                  {currentAction || `Выполняется: ${scenarioType}`}
                </div>
              </div>
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <p>Симуляция экрана эмулятора</p>
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '10px' }}>
                  {scenarioType}
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>Facebook</div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>Эмулятор не запущен</div>
            </div>
          )}
        </div>
        
        {/* Навигационные кнопки */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          marginTop: '10px',
          gap: '20px'
        }}>
          <div style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#333' }} />
          <div style={{ width: '15px', height: '15px', borderRadius: '3px', backgroundColor: '#333' }} />
          <div style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#333' }} />
        </div>
      </div>
    </div>
  );
}

export default function FacebookAutomation() {
  const [emulators, setEmulators] = useState<Emulator[]>([]);
  const [selectedEmulator, setSelectedEmulator] = useState<Emulator | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('login');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [currentAction, setCurrentAction] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  
  // Загрузка списка эмуляторов
  useEffect(() => {
    const fetchEmulators = async () => {
      try {
        console.log('Начинаем загрузку эмуляторов...');
        const response = await fetch('/api/emulators');
        console.log('Получен ответ от API:', response.status);
        
        if (!response.ok) {
          throw new Error('Не удалось получить список эмуляторов');
        }
        
        const data = await response.json();
        console.log('Получены данные эмуляторов:', data);
        
        if (!Array.isArray(data)) {
          console.error('Полученные данные не являются массивом:', data);
          throw new Error('Неверный формат данных');
        }
        
        setEmulators(data);
        console.log('Список эмуляторов обновлен:', data);
      } catch (error) {
        console.error('Ошибка при загрузке эмуляторов:', error);
        setError('Ошибка при загрузке эмуляторов');
      }
    };

    fetchEmulators();
  }, []);

  // Следим за выполнением сценария и обновляем текущее действие
  useEffect(() => {
    if (isRunning) {
      const actions = [
        'Запуск приложения',
        'Поиск элементов',
        'Ввод данных',
        'Нажатие кнопок',
        'Проверка результата'
      ];
      
      let actionIndex = 0;
      const updateAction = () => {
        if (actionIndex < actions.length && isRunning) {
          setCurrentAction(actions[actionIndex]);
          actionIndex++;
          setTimeout(updateAction, 1500 + Math.random() * 1000);
        }
      };
      
      updateAction();
    } else {
      setCurrentAction(undefined);
    }
  }, [isRunning]);

  // Обработчик выбора эмулятора
  const handleEmulatorSelect = (emulatorId: string) => {
    setSelectedEmulator(emulators.find(em => em.id === emulatorId) || null);
  };

  // Запуск сценария автоматизации
  const runAutomation = async () => {
    if (!selectedEmulator) {
      alert('Пожалуйста, выберите и запустите эмулятор');
      return;
    }

    if (selectedEmulator.status !== 'running') {
      alert('Эмулятор должен быть запущен');
      return;
    }

    setIsRunning(true);
    setResult(null);

    try {
      const response = await fetch('/api/emulators/automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: selectedEmulator.id,
          scenarioType: selectedScenarioId,
          accountId: selectedAccountId || undefined,
          port: selectedEmulator.port,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        console.log('Результат автоматизации:', data);
      } else {
        console.error('Ошибка при выполнении автоматизации:', data.error);
        setResult({
          success: false,
          message: 'Ошибка автоматизации',
          scenarioType: selectedScenarioId,
          deviceId: selectedEmulator.id,
          executionTimeMs: 0,
          actions: [],
          error: data.error || 'Неизвестная ошибка'
        });
      }
    } catch (error) {
      console.error('Ошибка при выполнении автоматизации:', error);
      setResult({
        success: false,
        message: 'Ошибка автоматизации',
        scenarioType: selectedScenarioId,
        deviceId: selectedEmulator.id,
        executionTimeMs: 0,
        actions: [],
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Автоматизация Facebook</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Левая колонка - настройки */}
        <div className="space-y-6">
          <EmulatorSelector 
            emulators={emulators}
            selectedEmulator={selectedEmulator}
            onSelect={setSelectedEmulator}
          />

          {/* Выбор аккаунта */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Выбрать аккаунт
            </label>
            <select
              className="w-full rounded-md border-gray-700 bg-gray-900 px-3 py-2 text-white"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
            >
              <option value="">Выберите аккаунт</option>
              {ACCOUNTS.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.email}
                </option>
              ))}
            </select>
          </div>

          {/* Выбор сценария */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Выбрать сценарий
            </label>
            <select
              className="w-full rounded-md border-gray-700 bg-gray-900 px-3 py-2 text-white"
              value={selectedScenarioId}
              onChange={(e) => setSelectedScenarioId(e.target.value)}
            >
              {SCENARIOS.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>
          </div>

          {/* Кнопка запуска */}
          <button
            onClick={runAutomation}
            disabled={!selectedEmulator || selectedEmulator.status !== 'running' || isRunning}
            className={`w-full rounded-md px-4 py-2 text-white font-medium ${
              !selectedEmulator || selectedEmulator.status !== 'running' || isRunning
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isRunning ? 'Выполняется...' : 'Запустить автоматизацию'}
          </button>

          {/* Результат выполнения */}
          {result && (
            <div className={`rounded-md p-4 ${
              result.success ? 'bg-green-900' : 'bg-red-900'
            }`}>
              <h3 className="font-medium text-white mb-2">
                {result.success ? 'Успешно' : 'Ошибка'}
              </h3>
              <p className="text-sm text-gray-300">{result.message}</p>
              {result.error && (
                <p className="text-sm text-red-300 mt-2">{result.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Правая колонка - визуализация */}
        <div className="flex justify-center">
          <EmulatorScreen
            running={isRunning}
            scenarioType={selectedScenarioId}
            currentAction={currentAction}
          />
        </div>
      </div>
    </div>
  );
} 