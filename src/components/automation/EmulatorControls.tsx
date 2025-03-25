import React, { useState } from 'react';
import { Emulator } from '@/types/emulator';

type EmulatorCommand = 'back' | 'home' | 'recent' | 'power' | string;

interface EmulatorControlsProps {
  emulator: Emulator;
  onCommand: (command: EmulatorCommand) => void;
}

const EmulatorControls: React.FC<EmulatorControlsProps> = ({
  emulator,
  onCommand,
}) => {
  const [command, setCommand] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      onCommand(command as EmulatorCommand);
      setCommand('');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Управление эмулятором</h3>
      
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label
            htmlFor="command"
            className="block text-sm font-medium text-gray-700"
          >
            Команда
          </label>
          <input
            type="text"
            id="command"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Введите команду..."
          />
        </div>
        <button
          type="submit"
          disabled={!command.trim()}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Отправить
        </button>
      </form>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">
          Быстрые команды
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onCommand('back')}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Назад
          </button>
          <button
            onClick={() => onCommand('home')}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Домой
          </button>
          <button
            onClick={() => onCommand('recent')}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Недавние
          </button>
          <button
            onClick={() => onCommand('power')}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Питание
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmulatorControls; 