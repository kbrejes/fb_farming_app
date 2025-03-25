import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { FarmingService } from '@/services/farming';

const prisma = new PrismaClient();
const farmingService = FarmingService.getInstance();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();

    if (!status || !['warming', 'ready', 'banned'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    if (status === 'ready') {
      await farmingService.stopFarming(params.id);
    }

    const account = await prisma.account.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error updating account status:', error);
    return NextResponse.json(
      { error: 'Failed to update account status' },
      { status: 500 }
    );
  }
} 