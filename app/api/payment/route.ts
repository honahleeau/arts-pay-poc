import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { accessToken, amount, token, cardholder } = body;

    // Validate required fields
    if (!accessToken || amount === undefined || !token || !cardholder) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['accessToken', 'amount', 'token', 'cardholder']
        },
        { status: 400 }
      );
    }

    // Validate amount is a positive number
    const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.FAT_ZEBRA_BASE_URL;

    if (!baseUrl) {
      return NextResponse.json(
        { error: 'Missing API base URL in environment variables' },
        { status: 500 }
      );
    }

    const paymentUrl = `${baseUrl}/v1.0/payments`;

    // Create payment request
    const paymentData = {
      amount: amountNum,
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

    // Handle non-JSON responses
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      return NextResponse.json(
        { 
          error: 'Payment failed',
          details: text || 'Unknown error',
          type: 'payment_error'
        },
        { status: response.status }
      );
    }

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
  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

