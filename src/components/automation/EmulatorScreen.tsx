'use client';

import React, { useState, useEffect } from 'react';
import { Emulator } from '@/types/emulator';

interface EmulatorScreenProps {
  emulator: Emulator;
  currentAction: string;
  isRunning: boolean;
}

const EmulatorScreen: React.FC<EmulatorScreenProps> = ({
  emulator,
  currentAction,
  isRunning,
}) => {
  const [screenUrl, setScreenUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!emulator || emulator.status !== 'running') {
      setScreenUrl('');
      return;
    }

    // Подключаемся к WebSocket для стриминга экрана
    const ws = new WebSocket(`ws://localhost:${emulator.port}/screen`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'screen') {
        setScreenUrl(data.url);
      }
    };

    ws.onerror = () => {
      setError('Ошибка подключения к стримингу экрана');
    };

    return () => {
      ws.close();
    };
  }, [emulator]);

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  if (!screenUrl) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-md">
        <p className="text-gray-500">
          {emulator.status === 'running'
            ? 'Загрузка экрана...'
            : 'Эмулятор не запущен'}
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={screenUrl}
        alt="Экран эмулятора"
        className="w-full rounded-md shadow-lg"
      />
      {isRunning && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md text-sm">
          {currentAction}
        </div>
      )}
    </div>
  );
};

export default EmulatorScreen; 