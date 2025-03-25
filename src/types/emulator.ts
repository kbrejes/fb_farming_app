export interface Emulator {
  id: string;
  name: string;
  status: 'stopped' | 'running' | 'error';
  port: number;
  deviceId: string;
  createdAt: string;
  updatedAt: string;
} 