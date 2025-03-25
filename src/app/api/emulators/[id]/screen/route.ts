import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

// Функция для получения снимка экрана с эмулятора
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID эмулятора не указан' },
        { status: 400 }
      );
    }

    const androidHome = process.env.ANDROID_HOME;
    if (!androidHome) {
      return NextResponse.json(
        { error: 'Переменная окружения ANDROID_HOME не установлена' },
        { status: 500 }
      );
    }

    const adbPath = `${androidHome}/platform-tools/adb`;

    // Получаем список запущенных эмуляторов
    const { stdout: runningDevices } = await execAsync(`${adbPath} devices`);
    const emulatorIds = runningDevices
      .split('\n')
      .filter(line => line.includes('emulator') && line.includes('device'))
      .map(line => line.split('\t')[0]);

    if (emulatorIds.length === 0) {
      return NextResponse.json(
        { error: 'Нет запущенных эмуляторов' },
        { status: 404 }
      );
    }

    // Находим эмулятор по ID
    let emulatorDevice = '';
    for (const emulatorId of emulatorIds) {
      const { stdout } = await execAsync(`${adbPath} -s ${emulatorId} emu avd name`);
      const name = stdout.split('\n')[0].trim();
      
      if (name === id) {
        emulatorDevice = emulatorId;
        break;
      }
    }

    if (!emulatorDevice) {
      return NextResponse.json(
        { error: 'Эмулятор не найден или не запущен' },
        { status: 404 }
      );
    }

    // Временный файл для сохранения скриншота
    const tmpDir = os.tmpdir();
    const screenshotPath = path.join(tmpDir, `emulator_${id}_screen.png`);

    // Делаем скриншот экрана
    await execAsync(`${adbPath} -s ${emulatorDevice} shell screencap -p /sdcard/screenshot.png`);
    await execAsync(`${adbPath} -s ${emulatorDevice} pull /sdcard/screenshot.png ${screenshotPath}`);

    // Проверяем, что файл создан
    if (!fs.existsSync(screenshotPath)) {
      return NextResponse.json(
        { error: 'Не удалось получить снимок экрана' },
        { status: 500 }
      );
    }

    // Читаем файл и отправляем как ответ
    const imageBuffer = fs.readFileSync(screenshotPath);
    
    // Удаляем временный файл
    fs.unlinkSync(screenshotPath);

    // Возвращаем изображение
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Ошибка при получении снимка экрана:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении снимка экрана' },
      { status: 500 }
    );
  }
} 