'use client';

import React, { useState } from 'react';
import type { Emulator } from './EmulatorManager';

interface EmulatorControlsProps {
  emulator: Emulator;
}

export function EmulatorControls({ emulator }: EmulatorControlsProps) {
  const [text, setText] = useState('');

  const sendKey = async (keyCode: string) => {
    try {
      await fetch(`/api/emulators/${emulator.id}/input`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'keyevent', keyCode }),
      });
    } catch (error) {
      console.error('Error sending key:', error);
    }
  };

  const sendText = async () => {
    if (!text) return;

    try {
      await fetch(`/api/emulators/${emulator.id}/input`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'text', text }),
      });
      setText('');
    } catch (error) {
      console.error('Error sending text:', error);
    }
  };

  const handleTap = async (x: number, y: number) => {
    try {
      await fetch(`/api/emulators/${emulator.id}/input`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'tap', x, y }),
      });
    } catch (error) {
      console.error('Error sending tap:', error);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => sendKey('KEYCODE_BACK')}
          className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
        >
          Назад
        </button>
        <button
          onClick={() => sendKey('KEYCODE_HOME')}
          className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
        >
          Домой
        </button>
        <button
          onClick={() => sendKey('KEYCODE_APP_SWITCH')}
          className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
        >
          Приложения
        </button>
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите текст..."
          className="flex-1 rounded bg-gray-700 px-3 py-2 text-white placeholder-gray-400"
        />
        <button
          onClick={sendText}
          disabled={!text}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-600"
        >
          Отправить
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => sendKey('KEYCODE_VOLUME_UP')}
          className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
        >
          Громкость +
        </button>
        <button
          onClick={() => sendKey('KEYCODE_VOLUME_DOWN')}
          className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
        >
          Громкость -
        </button>
        <button
          onClick={() => sendKey('KEYCODE_POWER')}
          className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
        >
          Питание
        </button>
        <button
          onClick={() => sendKey('KEYCODE_MENU')}
          className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
        >
          Меню
        </button>
      </div>
    </div>
  );
} 