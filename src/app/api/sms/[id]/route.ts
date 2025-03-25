import { NextResponse } from 'next/server';
import { SmsActivateService } from '@/services/smsActivate';

const smsService = new SmsActivateService({
  apiKey: process.env.SMS_ACTIVATE_API_KEY || ''
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const status = await smsService.getStatus(params.id);
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await smsService.cancelActivation(params.id);
    return NextResponse.json({ status: result });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cancel activation' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { action } = await request.json();
    let result;

    if (action === 'confirm') {
      result = await smsService.confirmActivation(params.id);
    } else {
      throw new Error('Invalid action');
    }

    return NextResponse.json({ status: result });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update activation' }, { status: 500 });
  }
} 