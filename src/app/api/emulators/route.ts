import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { name, androidVersion } = await request.json();

    if (!name || !androidVersion) {
      return NextResponse.json(
        { error: 'Необходимо указать name и androidVersion' },
        { status: 400 }
      );
    }

    // Проверяем переменную окружения ANDROID_HOME
    const androidHome = process.env.ANDROID_HOME;
    if (!androidHome) {
      return NextResponse.json(
        { error: 'Переменная окружения ANDROID_HOME не установлена' },
        { status: 500 }
      );
    }

    const avdmanagerPath = `${androidHome}/cmdline-tools/latest/bin/avdmanager`;

    // Проверяем наличие avdmanager
    try {
      await execAsync(`ls ${avdmanagerPath}`);
    } catch (err) {
      return NextResponse.json(
        { error: 'avdmanager не найден в системе' },
        { status: 500 }
      );
    }

    // Создаем эмулятор
    const createCommand = `${avdmanagerPath} create avd -n "${name}" -k "system-images;android-31;google_apis_playstore;arm64-v8a" -d "pixel_6"`;
    
    try {
      const { stdout, stderr } = await execAsync(createCommand);
      console.log('Emulator creation output:', stdout);
      
      if (stderr) {
        console.warn('Emulator creation warnings:', stderr);
      }

      // Проверяем, что эмулятор действительно создан
      const { stdout: listOutput } = await execAsync(`${avdmanagerPath} list avd`);
      if (!listOutput.includes(name)) {
        throw new Error('Эмулятор не найден в списке после создания');
      }

      return NextResponse.json({ 
        name,
        androidVersion,
        status: 'created',
        device: 'pixel_6'
      });
    } catch (err) {
      console.error('Error creating emulator:', err);
      return NextResponse.json(
        { error: `Ошибка при создании эмулятора: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}` },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('Error in POST /api/emulators:', err);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function GET() {
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

    // Получаем список эмуляторов
    console.log('Getting emulator list...');
    const { stdout: emulatorList } = await execAsync(
      `${emulatorPath} -list-avds`
    );
    console.log('Emulator list:', emulatorList);

    // Получаем список запущенных эмуляторов
    console.log('Getting running devices...');
    const { stdout: runningDevices } = await execAsync(`${adbPath} devices`);
    console.log('Running devices:', runningDevices);

    const runningEmulators = runningDevices
      .split('\n')
      .slice(1)
      .filter(line => line.includes('emulator'))
      .map(line => line.split('\t')[0]);

    console.log('Running emulators:', runningEmulators);

    // Получаем имена запущенных эмуляторов
    const runningEmulatorNames = await Promise.all(
      runningEmulators.map(async (emulator) => {
        try {
          const { stdout } = await execAsync(`${adbPath} -s ${emulator} emu avd name`);
          // Берем первую строку, игнорируя "OK" в конце
          const name = stdout.split('\n')[0].trim();
          return { emulator, name };
        } catch (error) {
          console.error(`Error getting name for ${emulator}:`, error);
          return { emulator, name: '' };
        }
      })
    );

    console.log('Running emulator names:', runningEmulatorNames);

    const emulators = emulatorList.split('\n')
      .filter(Boolean)
      .map(name => {
        const runningEmulator = runningEmulatorNames.find(e => e.name === name);
        return {
          id: name,
          name,
          status: runningEmulator ? 'running' : 'stopped',
          port: runningEmulator
            ? parseInt(runningEmulator.emulator.match(/\d+/)?.[0] || '0')
            : undefined
        };
      });

    console.log('Final emulator list:', emulators);

    return NextResponse.json(emulators);
  } catch (error) {
    console.error('Error listing emulators:', error);
    return NextResponse.json(
      { error: 'Failed to list emulators' },
      { status: 500 }
    );
  }
} 