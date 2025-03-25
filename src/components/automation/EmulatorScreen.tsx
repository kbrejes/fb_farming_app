'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const imgRef = useRef<HTMLImageElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Функция для обновления изображения
  const updateScreenshot = async () => {
    if (!emulator || emulator.status !== 'running') {
      setLoading(false);
      return;
    }

    try {
      // Обновляем параметр timestamp для обхода кэширования
      const timestamp = new Date().getTime();
      const url = `/api/emulators/${emulator.id}/screen?t=${timestamp}`;
      
      if (imgRef.current) {
        // Устанавливаем новый src для изображения
        imgRef.current.src = url;
        setLoading(false);
      }
    } catch (err) {
      console.error('Ошибка при обновлении скриншота:', err);
      setError('Не удалось получить изображение с эмулятора');
      setLoading(false);
    }
  };

  useEffect(() => {
    // При монтировании компонента начинаем обновлять скриншот
    if (emulator && emulator.status === 'running') {
      setLoading(true);
      
      // Сразу загружаем первый скриншот
      updateScreenshot();
      
      // Настраиваем интервал обновления (каждые 1000 мс)
      timerRef.current = setInterval(updateScreenshot, 1000);
    }

    // При размонтировании компонента очищаем интервал
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [emulator]);

  // Обработчик успешной загрузки изображения
  const handleImageLoad = () => {
    setLoading(false);
  };

  // Обработчик ошибки загрузки изображения
  const handleImageError = () => {
    setError('Не удалось загрузить изображение с эмулятора');
    setLoading(false);
  };

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  if (!emulator || emulator.status !== 'running') {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-md">
        <p className="text-gray-500">Эмулятор не запущен</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 rounded-md">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      <img
        ref={imgRef}
        alt="Экран эмулятора"
        className="w-full rounded-md shadow-lg"
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ minHeight: "400px", backgroundColor: "#f3f4f6" }}
      />
      
      {isRunning && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md text-sm">
          {currentAction || 'Выполнение...'}
        </div>
      )}
    </div>
  );
};

export default EmulatorScreen; 