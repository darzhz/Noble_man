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
        const message = error instanceof Error ? error.message : 'Failed to get status';
        // Return 422 for backend errors (e.g. expired/unknown request) so the client
        // treats them as hard failures instead of retrying for minutes as transient 500s.
        const status = message.includes('timeout') ? 504 : 422;
        return NextResponse.json(
            { error: message },
            { status }
        );
    }
}
