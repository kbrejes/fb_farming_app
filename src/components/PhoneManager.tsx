'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Loader2 as Loader } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import { SmsActivateService } from '@/services/sms-activate';

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
  const [noNumbers, setNoNumbers] = useState(false);
  const [getNumberLoading, setGetNumberLoading] = useState(false);

  // Загрузка активных активаций при загрузке страницы
  useEffect(() => {
    loadActivations();
    
    // Обновление каждые 30 секунд только если есть активные номера
    const interval = setInterval(() => {
      // Не обновляем автоматически, если только что получили номер или нет активных номеров
      if (activations.length > 0) {
        console.log('PhoneManager: Плановое обновление активаций...');
        loadActivations(false); // Параметр false указывает не очищать данные, если новых нет
      } else {
        console.log('PhoneManager: Пропуск автоматического обновления - нет активных номеров');
      }
    }, 30000);
    
    // Очистка интервала при размонтировании компонента
    return () => clearInterval(interval);
  }, [activations.length]); // Зависимость от количества активаций

  // Функция для загрузки активных активаций
  const loadActivations = async (clearIfEmpty = true) => {
    console.log('PhoneManager: Начало загрузки активаций...');
    setLoading(true);
    
    try {
      // Добавляем параметр force=1 для принудительного обновления
      const forceParam = clearIfEmpty ? '?force=1' : '';
      console.log(`PhoneManager: Отправка запроса GET /api/sms${forceParam}`);
      
      const response = await fetch(`/api/sms${forceParam}`);
      console.log('PhoneManager: Получен ответ со статусом:', response.status);
      
      const responseData = await response.json();
      console.log('PhoneManager: Получены данные:', JSON.stringify(responseData, null, 2));
      
      if (!response.ok) {
        throw new Error(`Ошибка загрузки активаций: ${responseData.error || 'Неизвестная ошибка'}`);
      }
      
      if (responseData.activeActivations) {
        console.log(`PhoneManager: Найдено ${responseData.activeActivations.length} активных номеров`);
        
        if (responseData.activeActivations.length > 0) {
          setActivations(responseData.activeActivations);
          setNoNumbers(false);
        } else {
          console.log('PhoneManager: Нет активных номеров в ответе');
          
          // Если параметр clearIfEmpty = false, сохраняем текущие номера
          if (clearIfEmpty) {
            console.log('PhoneManager: Очищаем список активаций');
            setActivations([]);
            setNoNumbers(true);
          } else {
            // Проверяем текущие активации, обновляем только если у нас их еще нет
            if (activations.length === 0) {
              console.log('PhoneManager: У нас уже и так нет активаций');
              setNoNumbers(true);
            } else {
              console.log('PhoneManager: Сохраняем текущие активации, несмотря на пустой ответ');
            }
          }
        }
      } else {
        console.log('PhoneManager: В ответе нет activeActivations');
        
        // Также сохраняем текущие активации, если не нужно очищать
        if (clearIfEmpty || activations.length === 0) {
          setActivations([]);
          setNoNumbers(true);
        } else {
          console.log('PhoneManager: Сохраняем текущие активации, несмотря на отсутствие данных');
        }
      }
    } catch (error) {
      console.error('PhoneManager: Ошибка при загрузке активаций:', error);
      
      // При ошибках сохраняем текущие активации
      if (activations.length === 0) {
        setNoNumbers(true);
      }
      
      setError(`Ошибка при загрузке номеров: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
      console.log('PhoneManager: Загрузка активаций завершена');
    }
  };

  const getNewPhoneNumber = async () => {
    try {
      setGetNumberLoading(true);
      setError(null);

      console.log('PhoneManager: Запрос нового номера...');
      const response = await fetch('/api/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ service: 'fb' }),
      });
      
      const data = await response.json();
      console.log('PhoneManager: Ответ на запрос нового номера:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка получения номера');
      }

      if (!data.id || !data.phone) {
        throw new Error('Некорректный ответ от сервера');
      }

      // Добавляем новый номер к существующим
      setActivations(prev => {
        // Проверяем, не дублируется ли номер
        const exists = prev.some(a => a.id === data.id);
        if (exists) {
          console.log(`PhoneManager: Номер ${data.id} уже существует в списке`);
          return prev;
        }
        
        console.log(`PhoneManager: Добавляем новый номер ${data.id} в список`);
        const updatedActivations = [...prev, data];
        console.log('PhoneManager: Обновленный список активаций:', updatedActivations);
        return updatedActivations;
      });
      
      // Сбрасываем флаг отсутствия номеров
      setNoNumbers(false);
      
      // Сообщаем пользователю об успехе
      setError(`Номер успешно получен: ${data.phone}`);
      
      // Не делаем автоматическое обновление сразу после получения номера
      // так как это может привести к потере только что полученного номера
    } catch (err) {
      console.error('PhoneManager: Ошибка получения номера:', err);
      setError(err instanceof Error ? err.message : 'Ошибка при получении номера');
    } finally {
      setGetNumberLoading(false);
    }
  };

  // Отмена активации
  const cancelActivation = async (id: string) => {
    // Проверка на валидность ID
    if (!id || id === 'status' || id === 'error' || !/^\d+$/.test(id)) {
      console.error(`PhoneManager: Неверный ID активации для отмены: ${id}`);
      setError(`Невозможно отменить активацию (неверный ID: ${id})`);
      return;
    }
    
    try {
      setActionLoading(id);
      setError(null);
      
      console.log(`PhoneManager: Отмена активации ${id}`);
      const response = await fetch(`/api/sms/cancel?id=${id}`, {
        method: 'GET',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка отмены активации');
      }
      
      // Обновляем список активаций после отмены
      await loadActivations();
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

  const requestSmsCode = async (id: string) => {
    // Проверка на валидность ID
    if (!id || id === 'status' || id === 'error' || !/^\d+$/.test(id)) {
      console.error(`PhoneManager: Неверный ID активации для запроса SMS: ${id}`);
      setError(`Невозможно запросить SMS для этого номера (неверный ID: ${id})`);
      return;
    }

    try {
      setActionLoading(id);
      setError(null);
      
      console.log(`PhoneManager: Запрос SMS кода для активации ${id}`);
      const response = await fetch(`/api/sms/code?id=${id}`, {
        method: 'GET',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка запроса SMS кода');
      }
      
      // Обновляем список активаций после запроса SMS
      await loadActivations();
      
      // Сообщаем пользователю об успешном запросе
      setError('SMS-код запрошен успешно. Ожидайте SMS на указанный номер.');
    } catch (err) {
      console.error('Ошибка при запросе SMS кода:', err);
      setError(err instanceof Error ? err.message : 'Не удалось запросить SMS код');
    } finally {
      setActionLoading(null);
    }
  };

  // Функция принудительного обновления (с очисткой кеша)
  const forceRefresh = async () => {
    console.log('PhoneManager: Принудительное обновление активаций...');
    setError(null);
    
    try {
      // Загружаем активации заново c флагом очистки (что вызовет параметр force=1)
      await loadActivations(true);
      
      // Сообщение о успешном обновлении
      if (activations.length > 0) {
        setError(`Успешно обновлено: найдено ${activations.length} активных номеров`);
      } else {
        setError('Обновлено. Активных номеров не найдено');
      }
    } catch (err) {
      console.error('Ошибка при принудительном обновлении:', err);
      setError('Не удалось обновить данные');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Управление телефонами</CardTitle>
        <CardDescription>
          {loading ? (
            'Загрузка активных номеров...'
          ) : error ? (
            <span className="text-red-500">{error}</span>
          ) : (
            `Активные номера: ${activations.length}`
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <>
            {activations.length > 0 ? (
              <div className="space-y-4">
                {activations.map((activation) => (
                  <div key={activation.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium flex items-center">
                        <span className="mr-2">📞</span> {activation.phone}
                        {activation.id && <span className="ml-3 text-xs text-gray-500">ID: {activation.id}</span>}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <span className="mr-2">📊</span> Статус: 
                        <span className={`ml-1 px-2 py-0.5 rounded ${
                          activation.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                          activation.status === 'code_received' ? 'bg-green-100 text-green-800' :
                          activation.status === 'finished' ? 'bg-blue-100 text-blue-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {activation.status === 'waiting' ? 'Ожидание' :
                           activation.status === 'code_received' ? 'Получен код' :
                           activation.status === 'finished' ? 'Завершено' : 'Отменено'}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <span className="mr-2">⏱️</span> Осталось: {activation.timeLeft}
                      </div>
                      {activation.code && (
                        <div className="text-sm font-bold text-green-600 mt-2 flex items-center">
                          <span className="mr-2">🔑</span> Код: {activation.code}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => requestSmsCode(activation.id)}
                        disabled={actionLoading === activation.id || activation.status === 'canceled'}
                      >
                        {actionLoading === activation.id ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          "Получить SMS"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelActivation(activation.id)}
                        disabled={actionLoading === activation.id || activation.status === 'canceled'}
                      >
                        {actionLoading === activation.id ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          "Отмена"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-xl font-medium mb-2">
                  {noNumbers ? "Нет активных номеров" : "Ошибка загрузки номеров"}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {noNumbers
                    ? "Получите новый номер, нажав на кнопку ниже"
                    : "Попробуйте перезагрузить страницу или получите новый номер"}
                </p>
              </div>
            )}

            <div className="flex justify-between mt-4">
              <Button
                onClick={getNewPhoneNumber}
                disabled={loading || getNumberLoading}
                className="w-2/3 mr-2"
              >
                {getNumberLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Получение номера...
                  </>
                ) : (
                  "Получить новый номер"
                )}
              </Button>
              
              <Button
                onClick={forceRefresh}
                disabled={loading}
                variant="outline"
                className="w-1/3"
              >
                {loading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  "Обновить"
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 