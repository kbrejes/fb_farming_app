import puppeteer from 'puppeteer';
import { randomInt } from 'crypto';
import type { Account } from '@/types';

export class FacebookService {
  private static instance: FacebookService;
  private browser: puppeteer.Browser | null = null;

  private constructor() {}

  public static getInstance(): FacebookService {
    if (!FacebookService.instance) {
      FacebookService.instance = new FacebookService();
    }
    return FacebookService.instance;
  }

  private async initBrowser(): Promise<puppeteer.Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-infobars',
          '--window-size=1366,768',
        ],
      });
    }
    return this.browser;
  }

  private async delay(min: number, max: number): Promise<void> {
    const delay = randomInt(min, max);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async registerAccount(account: Partial<Account>, phoneNumber: string): Promise<void> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    try {
      // Настройка User-Agent
      await page.setUserAgent('Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36');

      // Открываем страницу регистрации
      await page.goto('https://m.facebook.com/reg/', { waitUntil: 'networkidle0' });
      await this.delay(2000, 3000);

      // Заполняем форму регистрации
      await page.type('input[name="firstname"]', account.name?.split(' ')[0] || '', { delay: 100 });
      await page.type('input[name="lastname"]', account.name?.split(' ')[1] || '', { delay: 100 });
      await page.type('input[name="reg_email__"]', phoneNumber, { delay: 100 });
      await page.type('input[name="reg_passwd__"]', account.password || '', { delay: 100 });

      // Выбираем дату рождения
      await page.select('select#birthday_day', String(randomInt(1, 28)));
      await page.select('select#birthday_month', String(randomInt(1, 12)));
      await page.select('select#birthday_year', String(randomInt(1995, 2000)));

      // Выбираем пол
      await page.click('input[name="sex"][value="1"]'); // 1 = женский

      // Нажимаем кнопку регистрации
      await page.click('button[name="submit"]');
      await this.delay(3000, 5000);

      // Ждем SMS-код и вводим его (реализация в основном сервисе)
    } catch (error) {
      console.error('Error during Facebook registration:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<void> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    try {
      await page.goto('https://m.facebook.com/login/', { waitUntil: 'networkidle0' });
      await this.delay(2000, 3000);

      await page.type('input[name="email"]', email, { delay: 100 });
      await page.type('input[name="pass"]', password, { delay: 100 });
      await page.click('button[name="login"]');
      
      await this.delay(3000, 5000);
      
      // Проверяем успешность входа
      const url = page.url();
      if (url.includes('checkpoint') || url.includes('login')) {
        throw new Error('Login failed or security checkpoint required');
      }
    } catch (error) {
      console.error('Error during Facebook login:', error);
      throw error;
    }
  }

  async addFriends(count: number = 5): Promise<void> {
    const page = (await this.browser?.pages())?.[0];
    if (!page) throw new Error('Browser not initialized');

    try {
      await page.goto('https://m.facebook.com/friends/center/suggestions/', { waitUntil: 'networkidle0' });
      await this.delay(2000, 3000);

      for (let i = 0; i < count; i++) {
        const addButtons = await page.$$('button:contains("Добавить в друзья")');
        if (addButtons.length === 0) break;

        await addButtons[0].click();
        await this.delay(3000, 5000);
      }
    } catch (error) {
      console.error('Error adding friends:', error);
      throw error;
    }
  }

  async createPost(content: string, imageUrl?: string): Promise<void> {
    const page = (await this.browser?.pages())?.[0];
    if (!page) throw new Error('Browser not initialized');

    try {
      await page.goto('https://m.facebook.com/', { waitUntil: 'networkidle0' });
      await this.delay(2000, 3000);

      // Нажимаем на поле создания поста
      await page.click('textarea[name="xhpc_message"]');
      await this.delay(1000, 2000);

      // Вводим текст
      await page.type('textarea[name="xhpc_message"]', content, { delay: 100 });

      if (imageUrl) {
        // Добавляем изображение
        const imageInput = await page.$('input[type="file"]');
        if (imageInput) {
          await imageInput.uploadFile(imageUrl);
          await this.delay(3000, 5000);
        }
      }

      // Публикуем пост
      await page.click('button[type="submit"]');
      await this.delay(3000, 5000);
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
} 