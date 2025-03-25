import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface Device {
  id: string;
  name: string;
  isEmulator: boolean;
  status: 'online' | 'offline' | 'unknown';
}

/**
 * API-эндпоинт для получения списка подключенных устройств Android
 */
export async function GET() {
  console.log('GET /api/devices - Получение списка Android устройств');
  
  try {
    // Попытка получить реальные устройства через ADB
    // В случае ошибки используем мок-данные
    let devices: Device[] = [];
    
    try {
      const { stdout } = await execPromise('adb devices -l');
      console.log('Результат ADB devices:', stdout);
      
      // Парсинг вывода ADB для получения списка устройств
      const lines = stdout.split('\n').slice(1).filter(line => line.trim().length > 0);
      
      if (lines.length > 0) {
        devices = lines.map(line => {
          const parts = line.split(/\s+/);
          const id = parts[0];
          const status = parts[1] === 'device' ? 'online' : 'offline';
          
          // Определяем, является ли устройство эмулятором
          const isEmulator = id.startsWith('emulator-');
          
          // Получаем информацию о модели устройства
          let name = 'Android Device';
          if (line.includes('model:')) {
            const modelMatch = line.match(/model:(\S+)/);
            if (modelMatch && modelMatch[1]) {
              name = modelMatch[1].replace(/_/g, ' ');
            }
          }
          
          return { id, name, isEmulator, status };
        });
      }
    } catch (error) {
      console.warn('Не удалось получить список устройств через ADB:', error);
      // Если не получилось получить реальные устройства, используем мок-данные
    }
    
    // Если устройств не нашлось через ADB, используем тестовые данные
    if (devices.length === 0) {
      devices = [
        { id: 'emulator-5554', name: 'Pixel 4 API 30', isEmulator: true, status: 'online' },
        { id: 'emulator-5556', name: 'Pixel 6 API 31', isEmulator: true, status: 'offline' },
        { id: 'R58M23AVXPJ', name: 'Samsung Galaxy S21', isEmulator: false, status: 'online' },
        { id: 'adb-ZY322MK9PF-KmAxQs', name: 'Xiaomi Mi 10', isEmulator: false, status: 'offline' },
      ];
    }
    
    return NextResponse.json({
      devices,
      count: devices.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Ошибка при получении списка устройств:', error);
    
    return NextResponse.json(
      { 
        error: `Ошибка при получении списка устройств: ${error.message || String(error)}`,
        mockDevices: [
          { id: 'emulator-5554', name: 'Pixel 4 API 30 (mock)', isEmulator: true, status: 'online' },
          { id: 'emulator-5556', name: 'Pixel 6 API 31 (mock)', isEmulator: true, status: 'offline' },
        ] 
      },
      { status: 500 }
    );
  }
} 