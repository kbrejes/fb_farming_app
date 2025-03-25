'use client';

import { useState } from 'react';

interface Activation {
  id: string;
  phone: string;
  status: 'waiting' | 'code_received' | 'finished' | 'canceled';
  timeLeft: string;
}

export default function PhoneManager() {
  const [activations, setActivations] = useState<Activation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      console.error('Error getting number:', err);
      setError(err instanceof Error ? err.message : 'Ошибка при получении номера');
      setActivations(prev => prev);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Управление номерами</h2>
        <button
          onClick={getNewNumber}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors"
        >
          {loading ? 'Загрузка...' : 'Получить новый номер'}
        </button>
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
            <p className="font-bold">Номер: {activation.phone}</p>
            <p>Статус: {activation.status}</p>
            <p className="text-sm text-gray-500">
              Осталось времени: {activation.timeLeft}
            </p>
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