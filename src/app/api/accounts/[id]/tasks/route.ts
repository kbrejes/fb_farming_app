import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { FarmingService } from '@/services/farming';
import DatabaseService from '@/services/DatabaseService';

const prisma = new PrismaClient();
const farmingService = FarmingService.getInstance();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tasks = await prisma.task.findMany({
      where: { accountId: params.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { type } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Task type is required' },
        { status: 400 }
      );
    }

    const db = DatabaseService.getInstance();
    const task = await db.createTask({
      accountId: params.id,
      type,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
} 