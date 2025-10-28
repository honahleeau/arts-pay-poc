import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, amount, token, cardholder, type } = body;

    if (!accessToken || !amount || !token || !cardholder) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.FAT_ZEBRA_BASE_URL;

    if (!baseUrl) {
      return NextResponse.json(
        { error: 'Missing API base URL' },
        { status: 500 }
      );
    }

    const paymentUrl = `${baseUrl}/v1.0/payments`;

    // Create payment request
    const paymentData = {
      amount: amount,
      currency: 'AUD',
      description: 'Payment via Fat Zebra SDK',
      card_token: token,
      cardholder: {
        name: cardholder,
      },
    };

    const response = await fetch(paymentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'Payment failed', 
          details: data,
          type: 'payment_error'
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

