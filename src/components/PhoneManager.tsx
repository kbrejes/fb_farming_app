'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Country {
  id: string;
  name: string;
  count: number;
}

interface Activation {
  id: string;
  phone: string;
  status: string;
  timeLeft: string;
  code?: string | null;
  country?: string;
}

export default function PhoneManager() {
  const [activations, setActivations] = useState<Activation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingNumber, setLoadingNumber] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'phonenumbers' | 'settings'>('phonenumbers');
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('0'); // По умолчанию Россия
  const [loadingCountries, setLoadingCountries] = useState(false);

  // Загрузка стран при монтировании компонента
  useEffect(() => {
    loadCountries();
  }, []);

  // Загрузка активаций при монтировании и каждые 30 секунд
  useEffect(() => {
    loadActivations();
    
    const interval = setInterval(() => {
      loadActivations();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Загрузка доступных стран
  const loadCountries = async () => {
    try {
      setLoadingCountries(true);
      const response = await fetch('/api/sms', {
        method: 'OPTIONS'
      });
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить список стран');
      }
      
      const data = await response.json();
      console.log('Загружены страны:', data);
      
      if (data.countries && Array.isArray(data.countries)) {
        // Сортировка стран по названию
        const sortedCountries = [...data.countries].sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sortedCountries);
      }
    } catch (error) {
      console.error('Ошибка при загрузке стран:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при загрузке стран');
    } finally {
      setLoadingCountries(false);
    }
  };

  // Загрузка активных активаций
  const loadActivations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Загрузка активных активаций...');
      const response = await fetch('/api/sms');
      
      console.log('Получен ответ:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при получении активных номеров');
      }
      
      const data = await response.json();
      console.log('Данные активаций:', data);
      
      if (data.activeActivations && Array.isArray(data.activeActivations)) {
        console.log(`Получено ${data.activeActivations.length} активных номеров`);
        setActivations(data.activeActivations);
      } else {
        console.log('Нет активных номеров или неверный формат данных');
        setActivations([]);
      }
    } catch (error) {
      console.error('Ошибка при загрузке активаций:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при загрузке активных номеров');
    } finally {
      setLoading(false);
    }
  }, []);

  // Получение нового номера
  const getNewNumber = async () => {
    try {
      setLoadingNumber(true);
      setError(null);
      
      const response = await fetch('/api/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          service: 'fb',
          country: selectedCountry 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось получить номер');
      }
      
      const data = await response.json();
      console.log('Получен новый номер:', data);
      
      // Обновляем список активаций
      loadActivations();
    } catch (error) {
      console.error('Ошибка при получении номера:', error);
      setError(error instanceof Error ? error.message : 'Не удалось получить номер');
    } finally {
      setLoadingNumber(false);
    }
  };

  // Отмена активации
  const cancelActivation = async (id: string) => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/sms/cancel?id=${id}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось отменить активацию');
      }
      
      // Обновляем список активаций
      await loadActivations();
    } catch (error) {
      console.error('Ошибка при отмене активации:', error);
      setError(error instanceof Error ? error.message : 'Не удалось отменить активацию');
    } finally {
      setLoading(false);
    }
  };

  // Получение кода из SMS
  const getCode = async (id: string) => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/sms/code?id=${id}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось получить код');
      }
      
      const data = await response.json();
      if (data.success) {
        setCode('Запрос на получение SMS отправлен. Ожидайте получения кода.');
      } else if (data.code) {
        setCode(data.code);
      } else {
        throw new Error('Код еще не получен');
      }
      
      // Обновляем список активаций
      await loadActivations();
    } catch (error) {
      console.error('Ошибка при получении кода:', error);
      setError(error instanceof Error ? error.message : 'Не удалось получить код');
    } finally {
      setLoading(false);
    }
  };

  // Получение названия страны по id
  const getCountryName = (countryId: string): string => {
    const country = countries.find(c => c.id === countryId);
    return country ? country.name : 'Неизвестно';
  };

  return (
    <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Управление номерами телефонов</h2>
        <p className="mt-1 text-sm text-gray-400">
          Получайте временные номера для верификации аккаунтов
        </p>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('phonenumbers')}
            className={`px-4 py-2 rounded-t-lg ${
              activeTab === 'phonenumbers'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Номера телефонов
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-t-lg ${
              activeTab === 'settings'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Настройки
          </button>
        </div>
      </div>

      {activeTab === 'phonenumbers' && (
        <>
          <div className="mb-6 flex items-end space-x-4">
            <div className="flex-1">
              <label htmlFor="country" className="mb-2 block text-sm font-medium text-gray-400">
                Выберите страну
              </label>
              <select
                id="country"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                disabled={loadingCountries || loadingNumber}
                className="w-full rounded-md border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name} {country.count > 0 ? `(${country.count})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={getNewNumber}
              disabled={loading || loadingNumber}
              className={`ml-2 rounded-md px-6 py-2 font-medium ${
                loading || loadingNumber
                  ? 'cursor-not-allowed bg-gray-700 text-gray-400'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loadingNumber ? 'Загрузка...' : 'Получить номер'}
            </button>
            <button
              onClick={loadActivations}
              disabled={loading}
              className={`rounded-md p-2 ${
                loading
                  ? 'cursor-not-allowed bg-gray-700 text-gray-400'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
              title="Обновить"
            >
              🔄
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-900/50 p-3 text-red-200">
              <p>{error}</p>
            </div>
          )}

          {code && (
            <div className="mb-4 rounded-md bg-green-900/50 p-3 text-green-200">
              <p>Полученный код: <span className="font-mono font-bold">{code}</span></p>
              <button
                onClick={() => setCode(null)}
                className="mt-2 text-xs text-green-400 hover:text-green-300"
              >
                Закрыть
              </button>
            </div>
          )}

          <div className="rounded-md border border-gray-700">
            <table className="w-full table-auto">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Номер</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Страна</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Статус</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Осталось времени</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {activations.length > 0 ? (
                  activations.map((activation) => (
                    <tr key={activation.id} className="hover:bg-gray-700/50">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-white">
                        {activation.phone}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-white">
                        {activation.country ? getCountryName(activation.country) : 'Неизвестно'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            activation.status === 'waiting'
                              ? 'bg-yellow-800/30 text-yellow-200'
                              : activation.status === 'code_received'
                              ? 'bg-green-800/30 text-green-200'
                              : activation.status === 'canceled'
                              ? 'bg-red-800/30 text-red-200'
                              : 'bg-gray-800/30 text-gray-200'
                          }`}
                        >
                          {activation.status === 'waiting'
                            ? 'Ожидание SMS'
                            : activation.status === 'code_received'
                            ? 'Код получен'
                            : activation.status === 'canceled'
                            ? 'Отменено'
                            : activation.status === 'finished'
                            ? 'Завершено'
                            : activation.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-white">
                        {activation.timeLeft}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => getCode(activation.id)}
                            disabled={
                              loading ||
                              activation.status === 'canceled' ||
                              activation.status === 'finished'
                            }
                            className={`rounded px-2 py-1 text-xs ${
                              loading ||
                              activation.status === 'canceled' ||
                              activation.status === 'finished'
                                ? 'cursor-not-allowed bg-gray-700 text-gray-500'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            Получить код
                          </button>
                          <button
                            onClick={() => cancelActivation(activation.id)}
                            disabled={
                              loading ||
                              activation.status === 'canceled' ||
                              activation.status === 'finished'
                            }
                            className={`rounded px-2 py-1 text-xs ${
                              loading ||
                              activation.status === 'canceled' ||
                              activation.status === 'finished'
                                ? 'cursor-not-allowed bg-gray-700 text-gray-500'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                          >
                            Отмена
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                      {loading ? 'Загрузка активных номеров...' : 'Нет активных номеров'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4">
          <p className="text-gray-400">
            Настройки сервиса получения номеров. В разработке.
          </p>
        </div>
      )}
    </div>
  );
} 