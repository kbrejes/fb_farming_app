'use client';

import { useState, useEffect } from 'react';

interface Activation {
  id: string;
  phone: string;
  status: 'waiting' | 'code_received' | 'finished' | 'canceled';
  timeLeft: string;
  code?: string;
}

export default function PhoneManager() {
  const [activations, setActivations] = useState<Activation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Загрузка активных активаций при загрузке страницы
  useEffect(() => {
    loadActivations();
    
    // Обновление каждые 30 секунд
    const interval = setInterval(loadActivations, 30000);
    
    // Очистка интервала при размонтировании компонента
    return () => clearInterval(interval);
  }, []);

  // Функция для загрузки активных активаций
  const loadActivations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sms');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки активаций');
      }
      
      const data = await response.json();
      
      if (data.activeActivations) {
        setActivations(data.activeActivations);
      }
      
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке активаций:', err);
      setError(err instanceof Error ? err.message : 'Не удалось загрузить активации');
    } finally {
      setLoading(false);
    }
  };

  const getNewNumber = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ service: 'fb' }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка получения номера');
      }

      if (!data.id || !data.phone) {
        throw new Error('Некорректный ответ от сервера');
      }

      setActivations(prev => [...prev, data]);
      setError(null);
      
      // Загружаем все активации через 2 секунды, чтобы обновить статусы
      setTimeout(loadActivations, 2000);
    } catch (err) {
      console.error('Error getting number:', err);
      setError(err instanceof Error ? err.message : 'Ошибка при получении номера');
      setActivations(prev => prev);
    } finally {
      setLoading(false);
    }
  };

  // Отмена активации
  const cancelActivation = async (id: string) => {
    try {
      setActionLoading(id);
      const response = await fetch(`/api/sms/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка отмены активации');
      }
      
      // Обновляем статус локально
      setActivations(prev => prev.map(activation => 
        activation.id === id ? { ...activation, status: 'canceled' } : activation
      ));
      
      // Загружаем обновленные данные
      setTimeout(loadActivations, 2000);
    } catch (err) {
      console.error('Ошибка при отмене активации:', err);
      setError(err instanceof Error ? err.message : 'Не удалось отменить активацию');
    } finally {
      setActionLoading(null);
    }
  };

  // Проверка статуса активации
  const checkStatus = async (id: string) => {
    try {
      setActionLoading(id);
      const response = await fetch(`/api/sms/${id}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка проверки статуса');
      }
      
      const data = await response.json();
      
      // Обновляем активацию локально
      setActivations(prev => prev.map(activation => 
        activation.id === id ? { ...activation, ...data } : activation
      ));
    } catch (err) {
      console.error('Ошибка при проверке статуса:', err);
      setError(err instanceof Error ? err.message : 'Не удалось проверить статус');
    } finally {
      setActionLoading(null);
    }
  };

  // Установка статуса "готов получить SMS"
  const setReadyStatus = async (id: string) => {
    try {
      setActionLoading(id);
      const response = await fetch(`/api/sms/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'ready' }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка установки статуса');
      }
      
      // Загружаем обновленные данные
      await loadActivations();
    } catch (err) {
      console.error('Ошибка при установке статуса:', err);
      setError(err instanceof Error ? err.message : 'Не удалось установить статус');
    } finally {
      setActionLoading(null);
    }
  };

  // Получаем цвет статуса для UI
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'code_received':
        return 'bg-green-100 text-green-800';
      case 'finished':
        return 'bg-blue-100 text-blue-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Управление номерами</h2>
        <div>
          <button
            onClick={loadActivations}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2 disabled:opacity-50 transition-colors"
          >
            Обновить
          </button>
          <button
            onClick={getNewNumber}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors"
          >
            {loading ? 'Загрузка...' : 'Получить новый номер'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {activations.map((activation) => (
          <div
            key={activation.id}
            className="border rounded-lg p-4 bg-gray-50"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold">Номер: {activation.phone}</p>
                <p>
                  Статус: <span className={`px-2 py-1 rounded ${getStatusColor(activation.status)}`}>{activation.status}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Осталось времени: {activation.timeLeft}
                </p>
                {activation.code && (
                  <p className="mt-2 text-green-600 font-bold">
                    Код: {activation.code}
                  </p>
                )}
              </div>
              <div className="space-x-2">
                {activation.status !== 'canceled' && activation.status !== 'finished' && (
                  <>
                    <button
                      onClick={() => checkStatus(activation.id)}
                      disabled={actionLoading === activation.id || loading}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm disabled:opacity-50 transition-colors"
                    >
                      Проверить
                    </button>
                    <button
                      onClick={() => setReadyStatus(activation.id)}
                      disabled={actionLoading === activation.id || loading}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm disabled:opacity-50 transition-colors"
                    >
                      Запросить код
                    </button>
                    <button
                      onClick={() => cancelActivation(activation.id)}
                      disabled={actionLoading === activation.id || loading}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm disabled:opacity-50 transition-colors"
                    >
                      Отменить
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {!loading && activations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Нет активных номеров
          </div>
        )}
      </div>
    </div>
  );
} 