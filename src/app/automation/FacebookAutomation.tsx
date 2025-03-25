'use client';

import { useState, useEffect } from 'react';
import { Emulator } from '@/types/emulator';
import EmulatorSelector from '@/components/automation/EmulatorSelector';
import EmulatorScreen from '@/components/automation/EmulatorScreen';

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
          {selectedEmulator && (
            <EmulatorScreen
              emulator={selectedEmulator}
              currentAction={currentAction || ''}
              isRunning={isRunning}
            />
          )}
        </div>
      </div>
    </div>
  );
} 