'use client';

import React, { useState, useEffect } from 'react';
import { AccountsList } from '../components/AccountsList';
import { EmulatorManager } from '../components/EmulatorManager';
import PhoneManager from '@/components/PhoneManager';
import { AutomationManager } from '@/components/AutomationManager';
import type { Account } from '../types';
import Link from 'next/link';

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
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Facebook Farming App</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { href: '/sms', title: 'SMS верификация', description: 'Получение и управление SMS-кодами для верификации' },
          { href: '/emulators', title: 'Эмуляторы', description: 'Управление эмуляторами Android' },
          { href: '/automation', title: 'Автоматизация Facebook', description: 'Автоматизация действий в Facebook на эмуляторах' },
          { href: '/accounts', title: 'Аккаунты', description: 'Управление учетными записями Facebook' },
          { href: '/settings', title: 'Настройки', description: 'Настройки приложения и профиля' },
        ].map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className="block p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
            <p className="text-gray-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
} 