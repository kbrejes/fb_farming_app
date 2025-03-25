import { NextResponse } from 'next/server';
import type { Account } from '../../../types';

const accounts: Account[] = [
  {
    id: '457220d5-03ef-44ea-afd5-ed64f8191af0',
    email: 'test@example.com',
    password: 'Test123!',
    phoneNumber: '+79001234567',
    status: 'created',
    farmingDay: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    tasks: []
  }
];

export async function GET() {
  return NextResponse.json(accounts);
}

export async function POST(request: Request) {
  const data = await request.json();
  
  const newAccount: Account = {
    id: crypto.randomUUID(),
    email: data.email,
    password: data.password,
    phoneNumber: data.phoneNumber,
    status: 'created',
    farmingDay: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    tasks: []
  };

  accounts.push(newAccount);
  return NextResponse.json(newAccount, { status: 201 });
} 