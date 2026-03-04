import { NextResponse } from 'next/server';

const API_URL = 'https://api.darzh.xyz/api/method/get_prompt_templates';

export async function GET() {
    try {
        const res = await fetch(API_URL, {
            // Adding a small revalidation window or no-store
            // Prompt templates might change rarely, but no-store is safest
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Upstream API error: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] Failed to fetch prompt templates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch prompt templates' },
            { status: 500 }
        );
    }
}
