'use client';

import React from 'react';
import { Emulator } from '@/types/emulator';

interface EmulatorSelectorProps {
  emulators: Emulator[];
  selectedEmulator: Emulator | null;
  onSelect: (emulator: Emulator) => void;
}

export default function EmulatorSelector({
  emulators = [],
  selectedEmulator,
  onSelect,
}: EmulatorSelectorProps) {
  console.log('EmulatorSelector received emulators:', emulators);

  if (!emulators) {
    console.log('Emulators is undefined');
    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Выберите эмулятор
        </label>
        <div className="text-gray-400">Загрузка эмуляторов...</div>
      </div>
    );
  }

  if (emulators.length === 0) {
    console.log('Emulators array is empty');
    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Выберите эмулятор
        </label>
        <div className="text-gray-400">Нет доступных эмуляторов</div>
      </div>
    );
  }

  console.log('Rendering emulators list');
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">
        Выберите эмулятор
      </label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {emulators.map((emulator) => (
          <button
            key={emulator.id}
            onClick={() => onSelect(emulator)}
            className={`p-4 rounded-lg border ${
              selectedEmulator?.id === emulator.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 hover:border-gray-600'
            } text-left transition-colors`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">{emulator.name}</h3>
                <p className="text-sm text-gray-400">
                  Статус: {emulator.status}
                </p>
              </div>
              {emulator.status === 'running' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Запущен
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 