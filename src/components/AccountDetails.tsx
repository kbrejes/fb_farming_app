'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Account, Task } from '@/types';

interface AccountDetailsProps {
  account: Account;
  onClose: () => void;
}

export function AccountDetails({ account, onClose }: AccountDetailsProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/accounts/${account.id}/tasks`);
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [account.id]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await fetch(`/api/accounts/${account.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleExecuteTasks = async () => {
    try {
      setIsLoading(true);
      await fetch(`/api/accounts/${account.id}/tasks`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error executing tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded-lg bg-gray-800 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{account.name}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-gray-400">Email</p>
            <p className="text-white">{account.email}</p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-400">Телефон</p>
            <p className="text-white">{account.phoneNumber || 'Не указан'}</p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-400">Статус</p>
            <select
              value={account.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full rounded bg-gray-700 px-3 py-2 text-white"
            >
              <option value="created">Создан</option>
              <option value="warming">Прогрев</option>
              <option value="ready">Готов</option>
              <option value="banned">Забанен</option>
            </select>
          </div>
          <div className="space-y-2">
            <p className="text-gray-400">День фарминга</p>
            <p className="text-white">{account.farmingDay}/28</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Последние задачи</h3>
          {isLoading ? (
            <p className="text-gray-400">Загрузка...</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border border-gray-700 bg-gray-900 p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-white">
                      {task.type === 'post' && 'Публикация поста'}
                      {task.type === 'addFriend' && 'Добавление друзей'}
                      {task.type === 'like' && 'Лайки'}
                      {task.type === 'comment' && 'Комментарии'}
                      {task.type === 'watchVideo' && 'Просмотр видео'}
                    </p>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        task.status === 'completed'
                          ? 'bg-green-500 text-white'
                          : 'bg-yellow-500 text-black'
                      }`}
                    >
                      {task.status === 'completed' ? 'Выполнено' : 'В процессе'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-400">
                    {formatDistanceToNow(new Date(task.createdAt), {
                      addSuffix: true,
                      locale: ru,
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleExecuteTasks}
            disabled={isLoading}
            className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Выполнение...' : 'Выполнить задачи'}
          </button>
        </div>
      </div>
    </div>
  );
} 