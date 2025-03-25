'use client';

import React, { useState, useEffect } from 'react';
import { AccountsList } from '../components/AccountsList';
import { EmulatorManager } from '../components/EmulatorManager';
import PhoneManager from '@/components/PhoneManager';
import { AutomationManager } from '@/components/AutomationManager';
import type { Account } from '../types';

export default function Home() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/accounts');
        if (!response.ok) {
          throw new Error('Не удалось загрузить аккаунты');
        }
        const data = await response.json();
        setAccounts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleCreateAccount = async () => {
    try {
      const email = prompt('Введите email аккаунта:');
      if (!email) return;
      
      const password = prompt('Введите пароль аккаунта:');
      if (!password) return;
      
      const phoneNumber = prompt('Введите номер телефона (необязательно):');

      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, phoneNumber }),
      });

      if (!response.ok) {
        throw new Error('Не удалось создать аккаунт');
      }

      const newAccount = await response.json();
      setAccounts([newAccount, ...accounts]);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Произошла ошибка при создании аккаунта');
    }
  };

  const handleUpdateStatus = async (accountId: string, newStatus: Account['status']) => {
    if (!selectedAccount || updating) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Не удалось обновить статус');
      }

      const updatedAccount = await response.json();
      setAccounts(accounts.map(acc => 
        acc.id === accountId ? updatedAccount : acc
      ));
      setSelectedAccount(updatedAccount);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Произошла ошибка при обновлении статуса');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateFarmingDay = async (accountId: string, increment: boolean) => {
    if (!selectedAccount || updating) return;

    try {
      setUpdating(true);
      const newFarmingDay = increment 
        ? Math.min(selectedAccount.farmingDay + 1, 28)
        : 0;

      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmingDay: newFarmingDay }),
      });

      if (!response.ok) {
        throw new Error('Не удалось обновить день фарминга');
      }

      const updatedAccount = await response.json();
      setAccounts(accounts.map(acc => 
        acc.id === accountId ? updatedAccount : acc
      ));
      setSelectedAccount(updatedAccount);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Произошла ошибка при обновлении дня фарминга');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-red-500 p-4 text-white">
          <p className="text-lg font-semibold">Ошибка</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Facebook Farming Dashboard</h1>
          <p className="mt-2 text-gray-400">Управление аккаунтами и эмуляторами Android</p>
        </header>

        <div className="space-y-8">
          <EmulatorManager />
          <PhoneManager />
          <AutomationManager accounts={accounts} />

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-white">Активные аккаунты</h2>
                  <p className="text-sm text-gray-400">
                    Всего аккаунтов: {accounts.length}
                  </p>
                </div>
                
                <button
                  onClick={handleCreateAccount}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  Создать аккаунт
                </button>
              </div>

              <AccountsList
                accounts={accounts}
                onAccountSelect={(account) => setSelectedAccount(account)}
              />
            </div>
          </div>
        </div>

        {selectedAccount && (
          <div className="mt-4 rounded-lg bg-gray-800 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Детали аккаунта
              </h3>
              <button
                onClick={() => setSelectedAccount(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <p className="text-gray-300">Email: {selectedAccount.email}</p>
                <p className="text-gray-300">Телефон: {selectedAccount.phoneNumber || 'Не указан'}</p>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-300">День фарминга: {selectedAccount.farmingDay}/28</p>
                  <button
                    onClick={() => handleUpdateFarmingDay(selectedAccount.id, true)}
                    disabled={updating || selectedAccount.farmingDay >= 28}
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      updating || selectedAccount.farmingDay >= 28
                        ? 'cursor-not-allowed bg-gray-600 text-gray-400'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    +1 день
                  </button>
                  <button
                    onClick={() => handleUpdateFarmingDay(selectedAccount.id, false)}
                    disabled={updating || selectedAccount.farmingDay === 0}
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      updating || selectedAccount.farmingDay === 0
                        ? 'cursor-not-allowed bg-gray-600 text-gray-400'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    Сбросить
                  </button>
                </div>
                <p className="text-gray-300">Задач: {selectedAccount.tasks?.length || 0}</p>
              </div>
              
              <div className="space-x-2">
                <button
                  onClick={() => handleUpdateStatus(selectedAccount.id, 'warming')}
                  disabled={updating || selectedAccount.status === 'warming'}
                  className={`rounded px-3 py-1 text-sm font-medium ${
                    selectedAccount.status === 'warming'
                      ? 'bg-yellow-500 text-black'
                      : updating
                      ? 'cursor-not-allowed bg-gray-600 text-gray-400'
                      : 'bg-yellow-600 text-white hover:bg-yellow-700'
                  }`}
                >
                  Начать прогрев
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedAccount.id, 'ready')}
                  disabled={updating || selectedAccount.status === 'ready'}
                  className={`rounded px-3 py-1 text-sm font-medium ${
                    selectedAccount.status === 'ready'
                      ? 'bg-green-500 text-white'
                      : updating
                      ? 'cursor-not-allowed bg-gray-600 text-gray-400'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Готов к работе
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedAccount.id, 'banned')}
                  disabled={updating || selectedAccount.status === 'banned'}
                  className={`rounded px-3 py-1 text-sm font-medium ${
                    selectedAccount.status === 'banned'
                      ? 'bg-red-500 text-white'
                      : updating
                      ? 'cursor-not-allowed bg-gray-600 text-gray-400'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  Забанен
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 