import { NextResponse } from 'next/server';
import type { Account } from '../../../../types';

let accounts: Account[] = [
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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const accountIndex = accounts.findIndex(acc => acc.id === params.id);

    if (accountIndex === -1) {
      return NextResponse.json(
        { error: 'Аккаунт не найден' },
        { status: 404 }
      );
    }

    const updatedAccount = {
      ...accounts[accountIndex],
      ...data,
      updatedAt: new Date()
    };

    accounts[accountIndex] = updatedAccount;

    return NextResponse.json(updatedAccount);
  } catch (error) {
    return NextResponse.json(
      { error: 'Не удалось обновить аккаунт' },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const account = accounts.find(acc => acc.id === params.id);

  if (!account) {
    return NextResponse.json(
      { error: 'Аккаунт не найден' },
      { status: 404 }
    );
  }

  return NextResponse.json(account);
} 