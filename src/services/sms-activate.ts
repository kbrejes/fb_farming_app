interface SmsActivateResponse {
  status: string;
  phone?: string;
  id?: string;
  code?: string;
  error?: string;
}

export class SmsActivateService {
  private static instance: SmsActivateService;
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://api.sms-activate.org/stubs/handler_api.php';

  private constructor() {
    const apiKey = process.env.SMS_ACTIVATE_API_KEY;
    if (!apiKey) {
      throw new Error('SMS_ACTIVATE_API_KEY is not set in environment variables');
    }
    this.apiKey = apiKey;
  }

  public static getInstance(): SmsActivateService {
    if (!SmsActivateService.instance) {
      SmsActivateService.instance = new SmsActivateService();
    }
    return SmsActivateService.instance;
  }

  private async makeRequest(action: string, params: Record<string, string> = {}): Promise<SmsActivateResponse> {
    const url = new URL(this.baseUrl);
    url.searchParams.append('api_key', this.apiKey);
    url.searchParams.append('action', action);
    
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value);
    }

    try {
      const response = await fetch(url.toString());
      const text = await response.text();

      if (text.startsWith('ACCESS_BALANCE')) {
        return { status: 'success', ...this.parseBalance(text) };
      }

      if (text.startsWith('ACCESS_NUMBER')) {
        return { status: 'success', ...this.parseNumber(text) };
      }

      if (text.startsWith('STATUS_OK')) {
        return { status: 'success', code: text.split(':')[1] };
      }

      return { status: 'error', error: text };
    } catch (error) {
      console.error('SMS Activate API error:', error);
      return { status: 'error', error: 'Network error' };
    }
  }

  private parseBalance(response: string): { balance: string } {
    const balance = response.split(':')[1];
    return { balance };
  }

  private parseNumber(response: string): { id: string; phone: string } {
    const [id, phone] = response.split(':').slice(1);
    return { id, phone };
  }

  async getBalance(): Promise<number> {
    const response = await this.makeRequest('getBalance');
    if (response.status === 'error' || !response.balance) {
      throw new Error(response.error || 'Failed to get balance');
    }
    return parseFloat(response.balance);
  }

  async getNumber(service: string = 'fb'): Promise<{ id: string; phone: string }> {
    const response = await this.makeRequest('getNumber', { service });
    if (response.status === 'error' || !response.id || !response.phone) {
      throw new Error(response.error || 'Failed to get phone number');
    }
    return { id: response.id, phone: response.phone };
  }

  async getCode(id: string): Promise<string> {
    const response = await this.makeRequest('getStatus', { id });
    if (response.status === 'error' || !response.code) {
      throw new Error(response.error || 'Failed to get SMS code');
    }
    return response.code;
  }

  async setStatus(id: string, status: number): Promise<void> {
    const response = await this.makeRequest('setStatus', { id, status: status.toString() });
    if (response.status === 'error') {
      throw new Error(response.error || 'Failed to set status');
    }
  }
} 