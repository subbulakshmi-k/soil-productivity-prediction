import { NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/api-config';

export const dynamic = 'force-dynamic';

export const maxDuration = 300; // 5 minutes

export async function GET() {
  try {
    const response = await fetch(`${getApiUrl('/api/health')}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Failed to check backend health',
        model_loaded: false 
      },
      { status: 500 }
    );
  }
}
