import { NextRequest, NextResponse } from 'next/server';
import { submitFaceSwap, submitFaceSwapMultipart } from '@/lib/faceswap';

/** Strip data URL prefix if present, e.g. "data:image/png;base64,<data>" → "<data>" */
function stripDataUrlPrefix(s: string): string {
    return s.includes(',') ? s.split(',')[1] : s;
}

export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type') ?? '';

        // ------------------------------------------------------------------
        // Multipart / form-data path
        // ------------------------------------------------------------------
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            const userId = formData.get('user_id');
            if (!userId || typeof userId !== 'string') {
                return NextResponse.json(
                    { error: 'Missing required field: user_id' },
                    { status: 400 }
                );
            }

            const files = formData.getAll('images') as File[];
            const singleFile = formData.get('image') as File | null;
            const allFiles = files.length > 0 ? files : singleFile ? [singleFile] : [];

            if (allFiles.length === 0 || allFiles.length > 5) {
                return NextResponse.json(
                    { error: `images must be 1–5 files, got ${allFiles.length}` },
                    { status: 400 }
                );
            }

            const result = await submitFaceSwapMultipart(allFiles, userId, {
                customerName: formData.get('customer_name') as string | undefined ?? undefined,
                customerEmail: formData.get('customer_email') as string | undefined ?? undefined,
                callbackUrl: formData.get('callback_url') as string | undefined ?? undefined,
                promptTemplate: formData.get('prompt_template') as string | undefined ?? undefined,
            });

            return NextResponse.json({ message: result });
        }

        // ------------------------------------------------------------------
        // JSON body path
        // ------------------------------------------------------------------
        const body = await request.json();
        const { image, images, user_id, customer_name, customer_email, callback_url, prompt_template } = body;

        if (!user_id) {
            return NextResponse.json(
                { error: 'Missing required field: user_id' },
                { status: 400 }
            );
        }

        // Normalise to an array
        let imageArray: string[] = [];
        if (Array.isArray(images) && images.length > 0) {
            imageArray = images;
        } else if (typeof image === 'string' && image.length > 0) {
            imageArray = [image];
        }

        if (imageArray.length === 0) {
            return NextResponse.json(
                { error: 'Missing required field: image or images' },
                { status: 400 }
            );
        }

        if (imageArray.length > 5) {
            return NextResponse.json(
                { error: `images must be 1–5 items, got ${imageArray.length}` },
                { status: 400 }
            );
        }

        // Strip any data URL prefixes the client may have included
        const cleanImages = imageArray.map(stripDataUrlPrefix);

        const result = await submitFaceSwap(cleanImages, user_id, {
            customerName: customer_name || undefined,
            customerEmail: customer_email || undefined,
            callbackUrl: callback_url || undefined,
            promptTemplate: prompt_template || undefined,
        });

        return NextResponse.json({ message: result });
    } catch (error) {
        console.error('[API] Face swap process error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to submit face swap' },
            { status: 500 }
        );
    }
}
