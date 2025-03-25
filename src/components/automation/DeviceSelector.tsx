'use client';

import { useState, useEffect } from 'react';

interface Device {
  id: string;
  name: string;
  isEmulator: boolean;
  status: 'online' | 'offline' | 'unknown';
}

interface DeviceSelectorProps {
  onSelectDevice: (deviceId: string) => void;
  selectedDeviceId: string | null;
}

export default function DeviceSelector({ onSelectDevice, selectedDeviceId }: DeviceSelectorProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchDevices = async () => {
    setIsRefreshing(true);
    try {
      // Получаем список устройств с сервера
      const response = await fetch('/api/devices');
      const data = await response.json();
      
      if (response.ok) {
        setDevices(data.devices || []);
        console.log('Получен список устройств:', data.devices);
      } else {
        console.error('Ошибка при получении списка устройств:', data.error);
        // Если есть mock-устройства в ответе ошибки, используем их
        if (data.mockDevices && data.mockDevices.length > 0) {
          setDevices(data.mockDevices);
        }
      }
    } catch (error) {
      console.error('Ошибка при запросе списка устройств:', error);
      
      // Используем мок-данные в случае ошибки
      const mockDevices: Device[] = [
        { id: 'emulator-5554', name: 'Pixel 4 API 30 (fallback)', isEmulator: true, status: 'online' },
        { id: 'emulator-5556', name: 'Pixel 6 API 31 (fallback)', isEmulator: true, status: 'offline' },
      ];
      
      setDevices(mockDevices);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Выбираем устройство
  const handleSelectDevice = (deviceId: string) => {
    onSelectDevice(deviceId);
  };

  // Загружаем список устройств при монтировании компонента
  useEffect(() => {
    setIsLoading(true);
    fetchDevices().finally(() => setIsLoading(false));
  }, []);

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
        Выберите устройство
      </div>
      
      <div style={{ display: 'flex', marginBottom: '1rem' }}>
        <select 
          value={selectedDeviceId || ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSelectDevice(e.target.value)}
          disabled={isLoading || isRefreshing}
          style={{ flex: 1, marginRight: '0.5rem', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #ccc' }}
        >
          <option value="">-- Выберите устройство --</option>
          {devices.map((device) => (
            <option key={device.id} value={device.id} disabled={device.status !== 'online'}>
              {device.name} {device.isEmulator ? '(Эмулятор)' : ''} - {device.status}
            </option>
          ))}
        </select>
        
        <button 
          onClick={fetchDevices} 
          disabled={isRefreshing}
          style={{ 
            backgroundColor: isRefreshing ? '#ccc' : '#2196f3', 
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            cursor: isRefreshing ? 'not-allowed' : 'pointer'
          }}
        >
          {isRefreshing ? 'Обновление...' : 'Обновить'}
        </button>
      </div>
      
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
          <div style={{ marginLeft: '0.5rem' }}>Загрузка устройств...</div>
        </div>
      )}
      
      {!isLoading && devices.length === 0 && (
        <div style={{ color: 'red' }}>
          Не найдено доступных устройств. Убедитесь, что устройство подключено или эмулятор запущен.
        </div>
      )}
    </div>
  );
} 