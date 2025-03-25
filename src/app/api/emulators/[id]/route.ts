import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function PATCH(
  request: Request,
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

    const { newName } = await request.json();
    if (!newName) {
      return NextResponse.json(
        { error: 'Необходимо указать новое имя' },
        { status: 400 }
      );
    }

    // Проверяем существование эмулятора
    const { stdout: emulatorList } = await execAsync(
      `${androidHome}/emulator/emulator -list-avds`
    );

    if (!emulatorList.includes(params.id)) {
      return NextResponse.json(
        { error: 'Эмулятор не найден' },
        { status: 404 }
      );
    }

    // Переименовываем эмулятор
    const avdPath = path.join(process.env.HOME || '', '.android/avd');
    await execAsync(`mv "${avdPath}/${params.id}.avd" "${avdPath}/${newName}.avd"`);
    await execAsync(`mv "${avdPath}/${params.id}.ini" "${avdPath}/${newName}.ini"`);
    await execAsync(`sed -i '' "s/avd.name=${params.id}/avd.name=${newName}/" "${avdPath}/${newName}.ini"`);

    return NextResponse.json({
      id: newName,
      name: newName,
      status: 'stopped'
    });
  } catch (error) {
    console.error('Error updating emulator:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении эмулятора' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Проверяем существование эмулятора
    const { stdout: emulatorList } = await execAsync(
      `${androidHome}/emulator/emulator -list-avds`
    );

    if (!emulatorList.includes(params.id)) {
      return NextResponse.json(
        { error: 'Эмулятор не найден' },
        { status: 404 }
      );
    }

    // Проверяем, не запущен ли эмулятор
    const { stdout: runningDevices } = await execAsync(
      `${androidHome}/platform-tools/adb devices`
    );
    const isRunning = runningDevices.split('\n').some(line => 
      line.includes('emulator') && line.includes('device')
    );

    if (isRunning) {
      return NextResponse.json(
        { error: 'Нельзя удалить запущенный эмулятор. Сначала остановите его.' },
        { status: 400 }
      );
    }

    // Удаляем эмулятор
    await execAsync(
      `${androidHome}/cmdline-tools/latest/bin/avdmanager delete avd -n "${params.id}"`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting emulator:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении эмулятора' },
      { status: 500 }
    );
  }
} 