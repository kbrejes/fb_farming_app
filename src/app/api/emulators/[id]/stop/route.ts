import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
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
    const emulatorLine = runningDevices
      .split('\n')
      .find(line => line.includes('emulator'));

    if (!emulatorLine) {
      return NextResponse.json(
        { error: 'Эмулятор не запущен' },
        { status: 400 }
      );
    }

    // Получаем имя запущенного эмулятора
    const emulatorId = emulatorLine.split('\t')[0];
    const { stdout: avdName } = await execAsync(`${adbPath} -s ${emulatorId} emu avd name`);
    const name = avdName.split('\n')[0].trim();

    if (name !== params.id) {
      return NextResponse.json(
        { error: 'Запущен другой эмулятор' },
        { status: 400 }
      );
    }

    // Останавливаем эмулятор
    await execAsync(`${adbPath} -s ${emulatorId} emu kill`);

    // Ждем, пока эмулятор остановится
    let attempts = 0;
    const maxAttempts = 30;
    while (attempts < maxAttempts) {
      try {
        const { stdout } = await execAsync(`${adbPath} devices`);
        if (!stdout.includes(emulatorId)) {
          break;
        }
      } catch (error) {
        // Игнорируем ошибки
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Не удалось остановить эмулятор' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: params.id,
      name: params.id,
      status: 'stopped'
    });
  } catch (error) {
    console.error('Error stopping emulator:', error);
    return NextResponse.json(
      { error: `Failed to stop emulator: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 