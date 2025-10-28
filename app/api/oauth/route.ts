import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const clientId = process.env.FAT_ZEBRA_CLIENT_ID;
    const clientSecret = process.env.FAT_ZEBRA_CLIENT_SECRET;
    const oauthUrl = process.env.FAT_ZEBRA_OAUTH_URL;
    console.log('clientId', clientId);
    console.log('clientSecret', clientSecret);
    console.log('oauthUrl', oauthUrl);
    if (!clientId || !clientSecret || !oauthUrl) {
      return NextResponse.json(
        { error: 'Missing OAuth credentials' },
        { status: 500 }
      );
    }

    // Create basic auth token
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(oauthUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_key: clientId,
        access_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: 'Failed to obtain OAuth token', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

