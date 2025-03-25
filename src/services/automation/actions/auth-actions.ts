import { randomDelay, simulateTyping, humanLikeScroll, humanLikeClick } from './utils';

/**
 * Класс для автоматизации действий авторизации в Facebook
 */
export class AuthActions {
  constructor(private driver: WebdriverIO.Browser) {}
  
  /**
   * Устанавливает приложение Facebook
   * @param apkPath путь к APK файлу
   */
  async installFacebookApp(apkPath: string): Promise<void> {
    try {
      console.log('Установка приложения Facebook');
      await this.driver.installApp(apkPath);
      await randomDelay(1000, 3000);
      console.log('Приложение Facebook успешно установлено');
    } catch (error: any) {
      console.error('Ошибка при установке приложения Facebook:', error);
      throw new Error(`Не удалось установить приложение: ${error.message}`);
    }
  }
  
  /**
   * Запускает приложение Facebook
   */
  async launchFacebook(): Promise<void> {
    try {
      console.log('Запуск приложения Facebook');
      const appPackage = 'com.facebook.katana';
      const appActivity = 'com.facebook.katana.LoginActivity';
      
      await this.driver.activateApp(appPackage);
      await randomDelay(2000, 4000);
      
      // Проверяем, запустилось ли приложение
      const isAppOpen = await this.driver.isAppInstalled(appPackage);
      if (!isAppOpen) {
        throw new Error('Приложение Facebook не установлено');
      }
      
      console.log('Приложение Facebook успешно запущено');
    } catch (error: any) {
      console.error('Ошибка при запуске приложения Facebook:', error);
      throw new Error(`Не удалось запустить приложение: ${error.message}`);
    }
  }
  
  /**
   * Выполняет вход в аккаунт Facebook
   * @param email email или телефон
   * @param password пароль
   */
  async loginToFacebook(email: string, password: string): Promise<void> {
    try {
      console.log(`Вход в аккаунт Facebook: ${email}`);
      
      // Сначала запускаем приложение
      await this.launchFacebook();
      
      // Ждем появления поля для ввода email
      const emailSelector = '~Email или телефон';
      await this.driver.$(emailSelector).waitForDisplayed({ timeout: 10000 });
      
      // Находим поле email и вводим текст с имитацией человеческого набора
      const emailField = await this.driver.$(emailSelector);
      await simulateTyping(emailField, email);
      
      // Случайная пауза между вводом email и пароля
      await randomDelay(800, 2000);
      
      // Находим поле пароля и вводим текст с имитацией человеческого набора
      const passwordSelector = '~Пароль';
      const passwordField = await this.driver.$(passwordSelector);
      await simulateTyping(passwordField, password);
      
      // Случайная пауза перед нажатием на кнопку входа
      await randomDelay(1000, 2500);
      
      // Находим и нажимаем кнопку входа
      const loginButtonSelector = '~Войти';
      const loginButton = await this.driver.$(loginButtonSelector);
      await humanLikeClick(loginButton, this.driver);
      
      // Ждем загрузки ленты новостей или страницы профиля
      await randomDelay(5000, 10000);
      
      console.log('Вход в аккаунт Facebook выполнен успешно');
    } catch (error: any) {
      console.error('Ошибка при входе в аккаунт Facebook:', error);
      throw new Error(`Не удалось войти в аккаунт: ${error.message}`);
    }
  }
  
  /**
   * Регистрирует новый аккаунт Facebook
   * @param firstName имя
   * @param lastName фамилия
   * @param email email
   * @param password пароль
   * @param birthDate дата рождения в формате DD.MM.YYYY
   */
  async registerFacebookAccount(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    birthDate: string
  ): Promise<void> {
    try {
      console.log(`Регистрация нового аккаунта Facebook: ${email}`);
      
      // Запускаем приложение
      await this.launchFacebook();
      
      // Находим и нажимаем кнопку "Создать аккаунт"
      const createAccountSelector = '~Создать аккаунт';
      await this.driver.$(createAccountSelector).waitForDisplayed({ timeout: 10000 });
      const createAccountButton = await this.driver.$(createAccountSelector);
      await humanLikeClick(createAccountButton, this.driver);
      
      // Ждем появления формы регистрации
      await randomDelay(1000, 3000);
      
      // Заполняем имя
      const firstNameSelector = '~Имя';
      const firstNameField = await this.driver.$(firstNameSelector);
      await simulateTyping(firstNameField, firstName);
      
      // Заполняем фамилию
      const lastNameSelector = '~Фамилия';
      const lastNameField = await this.driver.$(lastNameSelector);
      await simulateTyping(lastNameField, lastName);
      
      // Нажимаем "Далее"
      const nextButton = await this.driver.$('~Далее');
      await humanLikeClick(nextButton, this.driver);
      await randomDelay(1000, 2000);
      
      // Выбираем дату рождения
      const [day, month, year] = birthDate.split('.');
      
      // Выбираем день
      const daySelector = `~${parseInt(day)}`;
      const dayOption = await this.driver.$(daySelector);
      await humanLikeClick(dayOption, this.driver);
      
      // Выбираем месяц
      const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
      ];
      const monthSelector = `~${monthNames[parseInt(month) - 1]}`;
      const monthOption = await this.driver.$(monthSelector);
      await humanLikeClick(monthOption, this.driver);
      
      // Выбираем год
      const yearSelector = `~${year}`;
      const yearOption = await this.driver.$(yearSelector);
      await humanLikeClick(yearOption, this.driver);
      
      // Нажимаем "Далее"
      await humanLikeClick(nextButton, this.driver);
      await randomDelay(1000, 2000);
      
      // Вводим email
      const emailField = await this.driver.$('~Мобильный телефон или эл. адрес');
      await simulateTyping(emailField, email);
      
      // Нажимаем "Далее"
      await humanLikeClick(nextButton, this.driver);
      await randomDelay(1000, 2000);
      
      // Вводим пароль
      const passwordField = await this.driver.$('~Пароль');
      await simulateTyping(passwordField, password);
      
      // Нажимаем "Зарегистрироваться"
      const registerButton = await this.driver.$('~Зарегистрироваться');
      await humanLikeClick(registerButton, this.driver);
      
      // Ждем завершения регистрации
      await randomDelay(5000, 10000);
      
      console.log('Регистрация аккаунта Facebook выполнена успешно');
    } catch (error: any) {
      console.error('Ошибка при регистрации аккаунта Facebook:', error);
      throw new Error(`Не удалось зарегистрировать аккаунт: ${error.message}`);
    }
  }
  
  /**
   * Выход из аккаунта Facebook
   */
  async logoutFromFacebook(): Promise<void> {
    try {
      console.log('Выход из аккаунта Facebook');
      
      // Открываем меню
      const menuButtonSelector = '~Меню';
      await this.driver.$(menuButtonSelector).waitForDisplayed({ timeout: 10000 });
      const menuButton = await this.driver.$(menuButtonSelector);
      await humanLikeClick(menuButton, this.driver);
      
      // Скроллим вниз до кнопки "Настройки"
      await humanLikeScroll(this.driver, 'down');
      await humanLikeScroll(this.driver, 'down');
      
      // Нажимаем на "Настройки и конфиденциальность"
      const settingsSelector = '~Настройки и конфиденциальность';
      const settingsButton = await this.driver.$(settingsSelector);
      await humanLikeClick(settingsButton, this.driver);
      
      // Нажимаем на "Настройки"
      const settingsMenuSelector = '~Настройки';
      const settingsMenuButton = await this.driver.$(settingsMenuSelector);
      await humanLikeClick(settingsMenuButton, this.driver);
      
      // Скроллим вниз до кнопки "Выход"
      await humanLikeScroll(this.driver, 'down');
      await humanLikeScroll(this.driver, 'down');
      await humanLikeScroll(this.driver, 'down');
      
      // Нажимаем на "Выход"
      const logoutSelector = '~Выход';
      const logoutButton = await this.driver.$(logoutSelector);
      await humanLikeClick(logoutButton, this.driver);
      
      // Подтверждаем выход
      const confirmLogoutSelector = '~Выйти';
      const confirmLogoutButton = await this.driver.$(confirmLogoutSelector);
      await humanLikeClick(confirmLogoutButton, this.driver);
      
      // Ждем завершения выхода
      await randomDelay(2000, 4000);
      
      console.log('Выход из аккаунта Facebook выполнен успешно');
    } catch (error: any) {
      console.error('Ошибка при выходе из аккаунта Facebook:', error);
      throw new Error(`Не удалось выйти из аккаунта: ${error.message}`);
    }
  }
} 