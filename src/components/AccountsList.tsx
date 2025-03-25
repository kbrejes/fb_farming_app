'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Account } from '../types';

interface AccountsListProps {
  accounts: Account[];
  onAccountSelect: (account: Account) => void;
}

export function AccountsList({ accounts, onAccountSelect }: AccountsListProps) {
  const [sortField, setSortField] = useState<keyof Account>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedAccounts = [...accounts].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === null || aValue === undefined || bValue === null || bValue === undefined) {
      return 0;
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleSort = (field: keyof Account) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th
              scope="col"
              className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-white hover:bg-gray-700"
              onClick={() => handleSort('email')}
            >
              Email
              {sortField === 'email' && (
                <span className="ml-2">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </th>
            <th
              scope="col"
              className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-white hover:bg-gray-700"
              onClick={() => handleSort('status')}
            >
              Статус
              {sortField === 'status' && (
                <span className="ml-2">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </th>
            <th
              scope="col"
              className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-white hover:bg-gray-700"
              onClick={() => handleSort('farmingDay')}
            >
              День фарминга
              {sortField === 'farmingDay' && (
                <span className="ml-2">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </th>
            <th
              scope="col"
              className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-white hover:bg-gray-700"
              onClick={() => handleSort('createdAt')}
            >
              Создан
              {sortField === 'createdAt' && (
                <span className="ml-2">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700 bg-gray-900">
          {sortedAccounts.map((account) => (
            <tr
              key={account.id}
              className="cursor-pointer transition-colors hover:bg-gray-800"
              onClick={() => onAccountSelect(account)}
            >
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-white">{account.email}</div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    account.status === 'created'
                      ? 'bg-blue-500 text-white'
                      : account.status === 'warming'
                      ? 'bg-yellow-500 text-black'
                      : account.status === 'ready'
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {account.status === 'created'
                    ? 'Создан'
                    : account.status === 'warming'
                    ? 'Прогрев'
                    : account.status === 'ready'
                    ? 'Готов'
                    : 'Забанен'}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-white">
                  {account.farmingDay}/28
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-400">
                  {formatDistanceToNow(new Date(account.createdAt), {
                    addSuffix: true,
                    locale: ru,
                  })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 