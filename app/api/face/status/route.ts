import { NextRequest, NextResponse } from 'next/server';
import { getFaceSwapStatus, FaceSwapStatusResponse } from '@/lib/faceswap';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { request_id } = body;

        if (!request_id) {
            return NextResponse.json(
                { error: 'Missing required field: request_id' },
                { status: 400 }
            );
        }

        const result: FaceSwapStatusResponse = await getFaceSwapStatus(request_id);

        return NextResponse.json({ message: result });
    } catch (error) {
        console.error('[API] Face swap status error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get status' },
            { status: 500 }
        );
    }
}
