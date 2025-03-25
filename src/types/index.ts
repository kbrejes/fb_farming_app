export interface Account {
  id: string;
  email: string;
  password: string;
  phoneNumber?: string | null;
  status: 'created' | 'warming' | 'ready' | 'banned';
  farmingDay: number;
  createdAt: Date;
  updatedAt: Date;
  tasks?: Task[];
}

export interface Task {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  createdAt: Date;
  updatedAt: Date;
  accountId: string;
  account?: Account;
}

export interface Note {
  id: string;
  createdAt: Date;
  content: string;
  accountId: string;
}

export interface Proxy {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  url: string;
  status: 'active' | 'used' | 'banned';
  lastUsed?: Date | null;
} 