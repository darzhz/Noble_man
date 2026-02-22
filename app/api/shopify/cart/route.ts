import { NextRequest, NextResponse } from 'next/server';
import { createCart } from '@/lib/shopify-utils';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productType, requestId } = body;

        if (!productType || !['digital', 'print'].includes(productType)) {
            return NextResponse.json(
                { error: 'Missing or invalid productType. Must be "digital" or "print".' },
                { status: 400 }
            );
        }

        if (!requestId) {
            return NextResponse.json(
                { error: 'Missing required field: requestId' },
                { status: 400 }
            );
        }

        let checkoutUrl = await createCart(productType as 'digital' | 'print', requestId);

        if (!checkoutUrl) {
            return NextResponse.json(
                { error: 'Shopify returned no checkout URL. Credentials may be missing or invalid.' },
                { status: 500 }
            );
        }

        // Append return_url so user is redirected back after payment
        const appOrigin = process.env.NEXT_PUBLIC_APP_URL || 'https://yourapp.com';
        const returnUrl = `${appOrigin}/result/${requestId}`;
        const separator = checkoutUrl.includes('?') ? '&' : '?';
        checkoutUrl = `${checkoutUrl}${separator}return_url=${encodeURIComponent(returnUrl)}`;

        return NextResponse.json({ checkoutUrl });
    } catch (error) {
        console.error('[API] Cart creation error:', error);
        const message = error instanceof Error ? error.message : 'Failed to create cart';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}

