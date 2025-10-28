import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payment, cardToken } = body;

    // You'll need to add SHARED_SECRET to your environment variables
    const sharedSecret = process.env.FAT_ZEBRA_SHARED_SECRET;

    if (!sharedSecret) {
      return NextResponse.json(
        { error: 'Missing SHARED_SECRET in environment variables' },
        { status: 500 }
      );
    }

    let verificationHash: string;

    if (cardToken) {
      // For existing card verification: hash(cardToken)
      verificationHash = createHmac('md5', sharedSecret)
        .update(cardToken)
        .digest('hex');
    } else if (payment) {
      // For new card verification: hash(payment.reference:amountcurrency)
      verificationHash = createHmac('md5', sharedSecret)
        .update(`${payment.reference}:${payment.amount}${payment.currency}`)
        .digest('hex');
    } else {
      return NextResponse.json(
        { error: 'Either payment or cardToken must be provided' },
        { status: 400 }
      );
    }

    return NextResponse.json({ verification: verificationHash });
  } catch (error) {
    console.error('Verification hash error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

