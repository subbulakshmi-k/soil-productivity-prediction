import { NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/api-config';

export const dynamic = 'force-dynamic';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    
    const response = await fetch(`${getApiUrl('/api/predict')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Prediction failed: ${error}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process prediction',
        success: false 
      },
      { status: 500 }
    );
  }
}
