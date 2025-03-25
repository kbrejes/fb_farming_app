/**
 * Ожидание случайного времени в заданном диапазоне
 * @param min минимальное время в мс
 * @param max максимальное время в мс
 */
export async function randomDelay(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Имитация человеческого набора текста с разной скоростью
 * @param element элемент для ввода текста
 * @param text текст для ввода
 */
export async function simulateTyping(
  element: WebdriverIO.Element,
  text: string
): Promise<void> {
  // Очищаем поле
  await element.clearValue();
  
  // Вводим посимвольно с разной скоростью
  for (const char of text) {
    await element.addValue(char);
    
    // Разное время между нажатиями клавиш (50-250ms)
    const typingDelay = Math.floor(Math.random() * 200) + 50;
    await new Promise(resolve => setTimeout(resolve, typingDelay));
    
    // Иногда делаем паузу как человек при печати (10% шанс)
    if (Math.random() < 0.1) {
      await new Promise(resolve => 
        setTimeout(resolve, 500 + Math.random() * 500)
      );
    }
  }
}

/**
 * Имитация человеческого скролла
 * @param driver WebdriverIO сессия
 * @param direction направление скролла (вверх или вниз)
 */
export async function humanLikeScroll(
  driver: WebdriverIO.Browser,
  direction: 'up' | 'down' = 'down'
): Promise<void> {
  const { width, height } = await driver.getWindowSize();
  
  const startX = width / 2;
  const startY = direction === 'down' ? height * 0.7 : height * 0.3;
  const endY = direction === 'down' ? height * 0.3 : height * 0.7;
  
  // Имитация неравномерного движения пальца
  await driver.touchAction([
    { action: 'press', x: startX, y: startY },
    { action: 'wait', ms: 100 + Math.random() * 200 },
    { action: 'moveTo', x: startX, y: startY - (startY - endY) * 0.3 },
    { action: 'wait', ms: 50 + Math.random() * 50 },
    { action: 'moveTo', x: startX, y: endY },
    { action: 'release' }
  ]);
  
  // Ждем случайное время после скролла
  await randomDelay(500, 2000);
}

/**
 * Имитация случайного нажатия с небольшим смещением от центра элемента
 * @param element элемент для нажатия
 * @param driver WebdriverIO сессия
 */
export async function humanLikeClick(
  element: WebdriverIO.Element,
  driver: WebdriverIO.Browser
): Promise<void> {
  const location = await element.getLocation();
  const size = await element.getSize();
  
  // Вычисляем центр элемента
  const centerX = location.x + size.width / 2;
  const centerY = location.y + size.height / 2;
  
  // Добавляем случайное смещение (-10px до +10px)
  const offsetX = (Math.random() - 0.5) * 20;
  const offsetY = (Math.random() - 0.5) * 20;
  
  // Координаты для клика
  const clickX = Math.round(centerX + offsetX);
  const clickY = Math.round(centerY + offsetY);
  
  // Выполняем нажатие
  await driver.touchAction({
    action: 'tap',
    x: clickX,
    y: clickY
  });
  
  // Случайная пауза после клика
  await randomDelay(300, 1500);
} 