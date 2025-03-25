'use client';

import React, { useState, useEffect } from 'react';

export interface Emulator {
  id: string;
  name: string;
  status: 'stopped' | 'running';
  port?: number;
}

interface EmulatorManagerProps {
  onEmulatorSelect: (emulator: Emulator) => void;
}

export function EmulatorManager() {
  const [emulators, setEmulators] = useState<Emulator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installingImage, setInstallingImage] = useState(false);
  const [creatingEmulator, setCreatingEmulator] = useState(false);
  const [editingEmulator, setEditingEmulator] = useState<string | null>(null);

  useEffect(() => {
    fetchEmulators();
  }, []);

  const fetchEmulators = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/emulators');
      if (!response.ok) {
        throw new Error('Не удалось получить список эмуляторов');
      }
      const data = await response.json();
      setEmulators(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const installSystemImage = async (androidVersion: string) => {
    try {
      setInstallingImage(true);
      setError(null);

      const response = await fetch('/api/emulators/system-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ androidVersion }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось установить системный образ');
      }

      // Ждем немного, чтобы система успела обработать установку
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Проверяем, что образ действительно установился
      const checkResponse = await fetch('/api/emulators/system-images');
      const images = await checkResponse.json();
      
      if (!Array.isArray(images) || !images.some(img => 
        img.androidVersion === androidVersion && img.variant.includes('google_apis;x86_64')
      )) {
        throw new Error('Системный образ не был установлен корректно');
      }
    } catch (err) {
      console.error('Error installing system image:', err);
      throw err;
    } finally {
      setInstallingImage(false);
    }
  };

  const createEmulator = async () => {
    try {
      setCreatingEmulator(true);
      setError(null);

      // Проверяем наличие системного образа
      const imagesResponse = await fetch('/api/emulators/system-images');
      const images = await imagesResponse.json();
      
      const targetVersion = '34';
      const hasImage = Array.isArray(images) && images.some(img => 
        img.androidVersion === targetVersion && img.variant.includes('google_apis;x86_64')
      );

      if (!hasImage) {
        await installSystemImage(targetVersion);
      }

      const response = await fetch('/api/emulators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `pixel_${Date.now()}`,
          androidVersion: targetVersion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось создать эмулятор');
      }

      // Обновляем список эмуляторов
      fetchEmulators();
    } catch (err) {
      console.error('Error creating emulator:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при создании эмулятора');
    } finally {
      setCreatingEmulator(false);
    }
  };

  const startEmulator = async (emulatorId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/emulators/${emulatorId}/start`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось запустить эмулятор');
      }

      setEmulators(emulators.map(em => 
        em.id === emulatorId ? data : em
      ));

      // Автоматически обновляем список эмуляторов через 2 секунды
      setTimeout(fetchEmulators, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const stopEmulator = async (emulatorId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/emulators/${emulatorId}/stop`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось остановить эмулятор');
      }

      setEmulators(emulators.map(em => 
        em.id === emulatorId ? data : em
      ));

      // Автоматически обновляем список эмуляторов через 2 секунды
      setTimeout(fetchEmulators, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmulator = async (emulatorId: string) => {
    const emulator = emulators.find(em => em.id === emulatorId);
    if (!emulator) return;

    const newName = prompt('Введите новое имя эмулятора:', emulator.name);
    if (!newName || newName === emulator.name) return;

    try {
      setEditingEmulator(emulatorId);
      setError(null);

      const response = await fetch(`/api/emulators/${emulatorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось обновить эмулятор');
      }

      setEmulators(emulators.map(em => 
        em.id === emulatorId ? data : em
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setEditingEmulator(null);
    }
  };

  const handleDeleteEmulator = async (emulatorId: string) => {
    const emulator = emulators.find(em => em.id === emulatorId);
    if (!emulator) return;

    if (!confirm(`Вы уверены, что хотите удалить эмулятор "${emulator.name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/emulators/${emulatorId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось удалить эмулятор');
      }

      setEmulators(emulators.filter(em => em.id !== emulatorId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg bg-gray-800 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Эмуляторы Android</h2>
        <button
          onClick={createEmulator}
          disabled={loading || installingImage || creatingEmulator}
          className={`rounded px-3 py-1 text-sm font-medium ${
            loading || installingImage || creatingEmulator
              ? 'cursor-not-allowed bg-gray-600 text-gray-400'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {creatingEmulator ? 'Создание эмулятора...' : installingImage ? 'Установка образа...' : 'Создать эмулятор'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-500 p-2 text-sm text-white">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {emulators.map(emulator => (
          <div
            key={emulator.id}
            className="flex items-center justify-between rounded bg-gray-700 p-3"
          >
            <div>
              <p className="font-medium text-white">{emulator.name}</p>
              <p className="text-sm text-gray-400">
                Статус: {emulator.status === 'running' ? 'Запущен' : 'Остановлен'}
                {emulator.port && ` (порт: ${emulator.port})`}
              </p>
            </div>
            <div className="space-x-2">
              {emulator.status === 'stopped' ? (
                <>
                  <button
                    onClick={() => startEmulator(emulator.id)}
                    disabled={loading || editingEmulator === emulator.id}
                    className={`rounded px-3 py-1 text-sm font-medium ${
                      loading || editingEmulator === emulator.id
                        ? 'cursor-not-allowed bg-gray-600 text-gray-400'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    Запустить
                  </button>
                  <button
                    onClick={() => handleEditEmulator(emulator.id)}
                    disabled={loading || editingEmulator === emulator.id}
                    className={`rounded px-3 py-1 text-sm font-medium ${
                      loading || editingEmulator === emulator.id
                        ? 'cursor-not-allowed bg-gray-600 text-gray-400'
                        : 'bg-yellow-600 text-white hover:bg-yellow-700'
                    }`}
                  >
                    {editingEmulator === emulator.id ? 'Сохранение...' : 'Изменить'}
                  </button>
                  <button
                    onClick={() => handleDeleteEmulator(emulator.id)}
                    disabled={loading || editingEmulator === emulator.id}
                    className={`rounded px-3 py-1 text-sm font-medium ${
                      loading || editingEmulator === emulator.id
                        ? 'cursor-not-allowed bg-gray-600 text-gray-400'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    Удалить
                  </button>
                </>
              ) : (
                <button
                  onClick={() => stopEmulator(emulator.id)}
                  disabled={loading}
                  className={`rounded px-3 py-1 text-sm font-medium ${
                    loading
                      ? 'cursor-not-allowed bg-gray-600 text-gray-400'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  Остановить
                </button>
              )}
            </div>
          </div>
        ))}

        {emulators.length === 0 && (
          <p className="text-center text-gray-400">
            Нет доступных эмуляторов. Создайте новый эмулятор, нажав кнопку выше.
          </p>
        )}
      </div>
    </div>
  );
} 