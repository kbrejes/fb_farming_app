import React, { useState, useEffect } from 'react';
import { Emulator } from '@/types/emulator';
import { AutomationScenarioType, AutomationScenarioSettings } from '@/types/automation';
import EmulatorScreen from './EmulatorScreen';
import EmulatorSelector from './EmulatorSelector';
import EmulatorControls from './EmulatorControls';

type EmulatorCommand = 'back' | 'home' | 'recent' | 'power' | string;

interface FacebookAutomationProps {
  onScenarioComplete?: (result: any) => void;
}

export const FacebookAutomation: React.FC<FacebookAutomationProps> = ({ onScenarioComplete }) => {
  const [emulators, setEmulators] = useState<Emulator[]>([]);
  const [selectedEmulator, setSelectedEmulator] = useState<Emulator | null>(null);
  const [currentAction, setCurrentAction] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [scenarioType, setScenarioType] = useState<AutomationScenarioType>('login');
  const [settings, setSettings] = useState<AutomationScenarioSettings>({});

  // Загрузка списка эмуляторов
  useEffect(() => {
    const fetchEmulators = async () => {
      try {
        console.log('Fetching emulators...');
        const response = await fetch('/api/emulators');
        if (!response.ok) {
          throw new Error('Не удалось получить список эмуляторов');
        }
        const data = await response.json();
        console.log('Received emulators:', data);
        setEmulators(data);
      } catch (error) {
        console.error('Ошибка при загрузке эмуляторов:', error);
        setError('Ошибка при загрузке эмуляторов');
      }
    };
    fetchEmulators();
  }, []);

  // Запуск сценария автоматизации
  const runScenario = async () => {
    if (!selectedEmulator) {
      setError('Выберите эмулятор');
      return;
    }

    setIsRunning(true);
    setError('');

    try {
      const response = await fetch('/api/emulators/automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: selectedEmulator.id,
          scenarioType,
          settings,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при запуске автоматизации');
      }

      const result = await response.json();
      onScenarioComplete?.(result);
    } catch (error) {
      console.error('Ошибка при запуске автоматизации:', error);
      setError('Ошибка при запуске автоматизации');
    } finally {
      setIsRunning(false);
    }
  };

  // Остановка автоматизации
  const stopAutomation = async () => {
    if (!selectedEmulator) return;

    try {
      const response = await fetch(`/api/emulators/${selectedEmulator.id}/stop`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Ошибка при остановке автоматизации');
      }

      setIsRunning(false);
    } catch (error) {
      console.error('Ошибка при остановке автоматизации:', error);
      setError('Ошибка при остановке автоматизации');
    }
  };

  const handleCommand = async (command: EmulatorCommand) => {
    if (!selectedEmulator) return;

    try {
      const response = await fetch(`/api/emulators/${selectedEmulator.id}/input`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при отправке команды');
      }
    } catch (error) {
      console.error('Ошибка при отправке команды:', error);
      setError('Ошибка при отправке команды');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Автоматизация Facebook</h2>
        <div className="space-x-2">
          <select
            value={scenarioType}
            onChange={(e) => setScenarioType(e.target.value as AutomationScenarioType)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="login">Вход в аккаунт</option>
            <option value="register">Регистрация</option>
            <option value="browse_feed">Просмотр ленты</option>
            <option value="add_friends">Добавление друзей</option>
            <option value="post_content">Публикация контента</option>
            <option value="message">Отправка сообщений</option>
            <option value="join_groups">Вступление в группы</option>
            <option value="like_posts">Лайки постов</option>
            <option value="comment_posts">Комментирование постов</option>
            <option value="update_profile">Обновление профиля</option>
            <option value="logout">Выход из аккаунта</option>
          </select>
          <button
            onClick={isRunning ? stopAutomation : runScenario}
            disabled={!selectedEmulator}
            className={`px-4 py-2 rounded-md ${
              isRunning
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white disabled:opacity-50`}
          >
            {isRunning ? 'Остановить' : 'Запустить'}
          </button>
        </div>
      </div>

      <EmulatorSelector
        emulators={emulators}
        selectedEmulator={selectedEmulator}
        onSelect={setSelectedEmulator}
      />

      {selectedEmulator && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <EmulatorScreen
              emulator={selectedEmulator}
              currentAction={currentAction}
              isRunning={isRunning}
            />
          </div>
          <div>
            <EmulatorControls
              emulator={selectedEmulator}
              onCommand={handleCommand}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}; 