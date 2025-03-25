/**
 * Типы для WebdriverIO и Appium
 */

declare namespace WebdriverIO {
  interface Browser {
    getWindowSize(): Promise<{ width: number; height: number }>;
    touchAction(actions: any[]): Promise<void>;
    activateApp(appId: string): Promise<void>;
    isAppInstalled(appId: string): Promise<boolean>;
    installApp(path: string): Promise<void>;
    deleteSession(): Promise<void>;
    $(selector: string): Promise<Element>;
    waitUntil(condition: () => Promise<boolean>, options?: { timeout?: number; timeoutMsg?: string }): Promise<void>;
  }

  interface Element {
    waitForDisplayed(options?: { timeout?: number }): Promise<void>;
    clearValue(): Promise<void>;
    addValue(value: string): Promise<void>;
    click(): Promise<void>;
    isDisplayed(): Promise<boolean>;
    getLocation(): Promise<{ x: number; y: number }>;
    getSize(): Promise<{ width: number; height: number }>;
  }
}
