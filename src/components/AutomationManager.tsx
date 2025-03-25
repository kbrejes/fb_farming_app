'use client';

import React, { useState, useEffect } from 'react';
import { AutomationScenarioParams, AutomationScenarioType, AutomationResult } from '@/types/automation';
import type { Account } from '@/types';

interface AutomationManagerProps {
  accounts: Account[];
}

export function AutomationManager({ accounts }: AutomationManagerProps) {
  // Состояния для управления автоматизацией
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [scenarioType, setScenarioType] = useState<AutomationScenarioType>('login');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<AutomationResult | null>(null);
  const [activeSessions, setActiveSessions] = useState<string[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [automationError, setAutomationError] = useState<string | null>(null);
  
  // Загрузка активных сессий
  const loadActiveSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const response = await fetch('/api/emulators/automation');
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить список активных сессий');
      }
      
      const data = await response.json();
      setActiveSessions(data.sessions || []);
    } catch (error) {
      console.error('Ошибка при загрузке активных сессий:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };
  
  // Загружаем активные сессии при монтировании компонента
  useEffect(() => {
    loadActiveSessions();
  }, []);
  
  // Функция закрытия всех активных сессий
  const closeAllSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const response = await fetch('/api/emulators/automation', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Не удалось закрыть активные сессии');
      }
      
      await loadActiveSessions();
    } catch (error) {
      console.error('Ошибка при закрытии активных сессий:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };
  
  // Запуск сценария автоматизации
  const runAutomationScenario = async () => {
    if (!selectedAccount || !deviceId || !scenarioType || isRunning) {
      return;
    }
    
    try {
      setIsRunning(true);
      setResult(null);
      setAutomationError(null);
      
      // Формируем параметры сценария
      const params: AutomationScenarioParams = {
        deviceId,
        accountId: selectedAccount.id,
        scenarioType,
        credentials: {
          email: selectedAccount.email,
          password: selectedAccount.password || '',
          phone: selectedAccount.phoneNumber || '',
          firstName: 'Пользователь', // В реальном приложении должно быть в аккаунте
          lastName: 'Тестовый',      // В реальном приложении должно быть в аккаунте
          birthDate: '01.01.1990'    // В реальном приложении должно быть в аккаунте
        }
      };
      
      // Отправляем запрос на запуск автоматизации
      const response = await fetch('/api/emulators/automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при запуске автоматизации');
      }
      
      // Обновляем результат
      setResult(data);
      
      // Обновляем список активных сессий
      await loadActiveSessions();
    } catch (error: any) {
      console.error('Ошибка при запуске автоматизации:', error);
      setAutomationError(error.message || 'Ошибка при запуске автоматизации');
    } finally {
      setIsRunning(false);
    }
  };
  
  // Список доступных сценариев
  const availableScenarios: { value: AutomationScenarioType; label: string }[] = [
    { value: 'login', label: 'Вход в аккаунт' },
    { value: 'register', label: 'Регистрация аккаунта' },
    { value: 'browse_feed', label: 'Просмотр ленты' },
    { value: 'like_posts', label: 'Лайки постов' },
    { value: 'add_friends', label: 'Добавление друзей' },
    { value: 'logout', label: 'Выход из аккаунта' }
  ];
  
  return (
    <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-white">
        Автоматизация Facebook
      </h2>
      <p className="mt-1 text-sm text-gray-400">
        Запуск автоматизированных сценариев для аккаунтов Facebook
      </p>
      
      <div className="mt-6 space-y-4">
        {/* Выбор аккаунта */}
        <div>
          <label className="block text-sm font-medium text-gray-400">
            Выбрать аккаунт
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-900 px-3 py-2 text-white"
            value={selectedAccount?.id || ''}
            onChange={(e) => {
              const account = accounts.find(a => a.id === e.target.value);
              setSelectedAccount(account || null);
            }}
          >
            <option value="">Выберите аккаунт</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.email}
              </option>
            ))}
          </select>
        </div>
        
        {/* Выбор ID устройства */}
        <div>
          <label className="block text-sm font-medium text-gray-400">
            ID устройства (эмулятора)
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-900 px-3 py-2 text-white"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            placeholder="Например, emulator-5554"
          />
          <p className="mt-1 text-xs text-gray-500">
            Используйте команду `adb devices` в терминале, чтобы получить ID эмулятора
          </p>
        </div>
        
        {/* Выбор сценария */}
        <div>
          <label className="block text-sm font-medium text-gray-400">
            Сценарий автоматизации
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-900 px-3 py-2 text-white"
            value={scenarioType}
            onChange={(e) => setScenarioType(e.target.value as AutomationScenarioType)}
          >
            {availableScenarios.map((scenario) => (
              <option key={scenario.value} value={scenario.value}>
                {scenario.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Кнопки действий */}
        <div className="flex space-x-4">
          <button
            className={`flex-1 rounded-md py-2 px-4 font-medium ${
              isRunning || !selectedAccount || !deviceId
                ? 'cursor-not-allowed bg-gray-700 text-gray-400'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            disabled={isRunning || !selectedAccount || !deviceId}
            onClick={runAutomationScenario}
          >
            {isRunning ? 'Выполняется...' : 'Запустить сценарий'}
          </button>
          
          <button
            className={`rounded-md py-2 px-4 font-medium ${
              isLoadingSessions
                ? 'cursor-not-allowed bg-gray-700 text-gray-400'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
            disabled={isLoadingSessions}
            onClick={loadActiveSessions}
          >
            Обновить сессии
          </button>
          
          <button
            className={`rounded-md py-2 px-4 font-medium ${
              isLoadingSessions || activeSessions.length === 0
                ? 'cursor-not-allowed bg-gray-700 text-gray-400'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            disabled={isLoadingSessions || activeSessions.length === 0}
            onClick={closeAllSessions}
          >
            Закрыть все сессии
          </button>
        </div>
      </div>
      
      {/* Информация об активных сессиях */}
      <div className="mt-6">
        <h3 className="text-md font-medium text-white">
          Активные сессии: {isLoadingSessions ? 'Загрузка...' : activeSessions.length}
        </h3>
        {activeSessions.length > 0 && (
          <div className="mt-2 space-y-2">
            {activeSessions.map((sessionId) => (
              <div key={sessionId} className="rounded bg-gray-700 p-2 text-sm text-gray-300">
                Сессия: {sessionId}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Результат выполнения сценария */}
      {result && (
        <div className={`mt-6 rounded-md p-4 ${
          result.success
            ? 'bg-green-900/30 text-green-200'
            : 'bg-red-900/30 text-red-200'
        }`}>
          <h3 className="text-md font-medium">
            {result.success ? 'Сценарий выполнен успешно' : 'Ошибка выполнения сценария'}
          </h3>
          <p className="mt-1 text-sm">
            Время выполнения: {(result.executionTimeMs / 1000).toFixed(2)} сек
          </p>
          {result.error && (
            <p className="mt-1 text-sm">
              Ошибка: {result.error}
            </p>
          )}
          {result.actions && result.actions.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-medium">Выполненные действия:</h4>
              <ul className="mt-1 list-inside list-disc">
                {result.actions.map((action, index) => (
                  <li key={index} className="text-sm">
                    {action.name}: {action.success ? 'Успешно' : 'Ошибка'} 
                    ({(action.timeMs / 1000).toFixed(2)} сек)
                    {action.error && ` - ${action.error}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Сообщение об ошибке */}
      {automationError && !result && (
        <div className="mt-6 rounded-md bg-red-900/30 p-4 text-red-200">
          <h3 className="text-md font-medium">Ошибка</h3>
          <p className="mt-1 text-sm">{automationError}</p>
        </div>
      )}
    </div>
  );
} 