import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

const ANDROID_HOME = process.env.ANDROID_HOME || '/Users/kirill/Library/Android/sdk';
const CMDLINE_TOOLS = path.join(ANDROID_HOME, 'cmdline-tools/latest/bin');

async function checkAndroidSDK() {
  try {
    // Проверяем наличие sdkmanager
    await execAsync(`${CMDLINE_TOOLS}/sdkmanager --version`);
    return true;
  } catch (error) {
    console.error('SDK Manager not found:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    if (!await checkAndroidSDK()) {
      return NextResponse.json(
        { error: 'Android SDK не найден. Убедитесь, что Android Studio установлена и ANDROID_HOME настроен правильно.' },
        { status: 500 }
      );
    }

    const { androidVersion } = await request.json();
    console.log('Installing system image for Android', androidVersion);

    // Принимаем лицензии Android SDK
    try {
      await execAsync(`yes | ${CMDLINE_TOOLS}/sdkmanager --licenses`);
    } catch (error) {
      console.error('Error accepting licenses:', error);
      // Продолжаем выполнение, так как ошибка может быть из-за уже принятых лицензий
    }

    // Устанавливаем системный образ
    console.log('Running sdkmanager to install system image...');
    const { stdout, stderr } = await execAsync(
      `${CMDLINE_TOOLS}/sdkmanager ` +
      `"system-images;android-${androidVersion};google_apis;x86_64"`
    );
    
    console.log('Installation output:', stdout);
    if (stderr) console.error('Installation errors:', stderr);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error installing system image:', error);
    return NextResponse.json(
      { error: `Ошибка установки системного образа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!await checkAndroidSDK()) {
      return NextResponse.json([]);
    }

    console.log('Listing installed packages...');
    // Получаем список установленных системных образов
    const { stdout, stderr } = await execAsync(
      `${CMDLINE_TOOLS}/sdkmanager --list_installed`
    );

    if (stderr) console.error('List errors:', stderr);
    console.log('List output:', stdout);

    const images = stdout
      .split('\n')
      .filter(line => line.includes('system-images'))
      .map(line => {
        const match = line.match(/system-images;android-(\d+);([^|]+)/);
        return match ? {
          androidVersion: match[1],
          variant: match[2].trim()
        } : null;
      })
      .filter((img): img is { androidVersion: string; variant: string } => img !== null);

    console.log('Found images:', images);
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error listing system images:', error);
    return NextResponse.json([]);
  }
} 