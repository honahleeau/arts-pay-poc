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

    const { accessToken, amount, token, cardholder, reference } = body;

    // Validate required fields
    if (amount === undefined || !token || !cardholder) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['amount', 'token', 'cardholder']
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
    const merchantUsername = process.env.NEXT_PUBLIC_FAT_ZEBRA_USERNAME;
    const gatewayToken = process.env.FAT_ZEBRA_TOKEN;

    if (!baseUrl) {
      return NextResponse.json(
        { error: 'Missing API base URL in environment variables' },
        { status: 500 }
      );
    }

    if (!merchantUsername) {
      return NextResponse.json(
        { error: 'Missing NEXT_PUBLIC_FAT_ZEBRA_USERNAME in environment variables' },
        { status: 500 }
      );
    }

    if (!gatewayToken) {
      return NextResponse.json(
        { error: 'Missing FAT_ZEBRA_TOKEN in environment variables' },
        { status: 500 }
      );
    }

    const paymentUrl = `${baseUrl}/v1.0/purchases`;

    const customerIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      undefined;

    // Fat Zebra amount is in the smallest currency unit (cents for AUD)
    const amountInCents = Math.round(amountNum * 100);
    const purchaseReference =
      typeof reference === 'string' && reference.trim()
        ? reference.trim()
        : `payment_${Date.now()}`;

    // Create purchase request
    const paymentData = {
      amount: amountInCents,
      reference: purchaseReference,
      currency: 'AUD',
      card_token: token,
      customer_ip: customerIp || '127.0.0.1',
      card_holder: cardholder,
    };

    // Fat Zebra gateway purchases endpoint expects Basic auth:
    // base64("<merchant-username>:<merchant-token>")
    const basicAuth = Buffer.from(`${merchantUsername}:${gatewayToken}`).toString('base64');
    const response = await fetch(paymentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
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

    // Fat Zebra can return HTTP 200 with successful=false and errors/message
    if (data && data.successful === false) {
      const gatewayMessage =
        data.message ||
        (Array.isArray(data.errors) ? data.errors.join(', ') : undefined) ||
        'Unknown payment gateway error';

      return NextResponse.json(
        {
          error: 'Payment failed',
          message: gatewayMessage,
          details: data,
          type: 'payment_error',
        },
        { status: 400 }
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

