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
    const emulatorPath = `${androidHome}/emulator/emulator`;

    // Проверяем, не запущен ли уже эмулятор
    const { stdout: runningDevices } = await execAsync(`${adbPath} devices`);
    const emulatorLine = runningDevices
      .split('\n')
      .find(line => line.includes(params.id));

    let emulatorPort: number;

    if (!emulatorLine) {
      // Если эмулятор не запущен, запускаем его
      console.log('Starting emulator:', params.id);
      
      // Ищем свободный порт
      let emulatorPort = 5554;
      let portFound = false;
      
      while (!portFound && emulatorPort <= 5584) { // Пробуем порты от 5554 до 5584
        try {
          await execAsync(`lsof -i :${emulatorPort}`);
          emulatorPort += 2;
        } catch (error) {
          // Если команда вернула ошибку, значит порт свободен
          portFound = true;
        }
      }

      if (!portFound) {
        throw new Error('No available ports found');
      }

      console.log('Using port:', emulatorPort);

      // Запускаем эмулятор с конкретным портом
      console.log('Running emulator command:', `${emulatorPath} -avd "${params.id}" -port ${emulatorPort} -no-snapshot-load -read-only`);
      const emulatorProcess = exec(
        `${emulatorPath} ` +
        `-avd "${params.id}" ` +
        `-port ${emulatorPort} ` +
        `-no-snapshot-load ` +
        `-read-only`
      );

      emulatorProcess.stdout?.on('data', (data) => {
        console.log('Emulator stdout:', data);
      });

      emulatorProcess.stderr?.on('data', (data) => {
        console.error('Emulator stderr:', data);
      });

      // Ждем, пока эмулятор загрузится
      await new Promise<void>((resolve, reject) => {
        let bootTimeout: NodeJS.Timeout;
        let attempts = 0;
        const maxAttempts = 180; // 3 минуты ожидания

        const checkBoot = async () => {
          try {
            console.log('Checking boot status...');
            const { stdout } = await execAsync(`${adbPath} -s emulator-${emulatorPort} shell getprop sys.boot_completed`);
            console.log('Boot status:', stdout.trim());
            if (stdout.trim() === '1') {
              clearTimeout(bootTimeout);
              resolve();
            } else {
              attempts++;
              if (attempts >= maxAttempts) {
                reject(new Error('Timeout waiting for emulator to boot'));
              } else {
                setTimeout(checkBoot, 1000);
              }
            }
          } catch (error) {
            console.error('Error checking boot status:', error);
            attempts++;
            if (attempts >= maxAttempts) {
              reject(new Error('Timeout waiting for emulator to boot'));
            } else {
              setTimeout(checkBoot, 1000);
            }
          }
        };

        // Устанавливаем таймаут в 10 минут
        bootTimeout = setTimeout(() => {
          emulatorProcess.kill();
          reject(new Error('Timeout waiting for emulator to boot'));
        }, 10 * 60 * 1000);

        checkBoot();
      });

      // Настраиваем проброс портов для стриминга экрана
      try {
        await execAsync(
          `${adbPath} -s emulator-${emulatorPort} forward tcp:${emulatorPort} localabstract:screen`
        );
      } catch (error) {
        console.error('Error setting up port forwarding:', error);
        // Продолжаем выполнение, так как это не критическая ошибка
      }

      // Получаем имя эмулятора
      const { stdout: avdName } = await execAsync(`${adbPath} -s emulator-${emulatorPort} emu avd name`);
      const name = avdName.split('\n')[0].trim();

      return NextResponse.json({
        id: name,
        name,
        status: 'running',
        port: emulatorPort
      });
    } else {
      // Если эмулятор уже запущен, получаем его порт
      const match = emulatorLine.match(/emulator-(\d+)/);
      if (!match) {
        throw new Error('Could not determine emulator port');
      }
      emulatorPort = parseInt(match[1], 10);
    }

    // Настраиваем проброс портов для стриминга экрана
    await execAsync(
      `${adbPath} -s emulator-${emulatorPort} forward tcp:${emulatorPort} localabstract:screen`
    );

    // Получаем имя эмулятора
    const { stdout: avdName } = await execAsync(`${adbPath} -s emulator-${emulatorPort} emu avd name`);
    const name = avdName.split('\n')[0].trim();

    return NextResponse.json({
      id: name,
      name,
      status: 'running',
      port: emulatorPort
    });
  } catch (error) {
    console.error('Error starting emulator:', error);
    return NextResponse.json(
      { error: `Failed to start emulator: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 