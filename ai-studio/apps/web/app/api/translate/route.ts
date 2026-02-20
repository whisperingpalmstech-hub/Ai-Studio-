import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { text, sourceLang, targetLang } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }

        const sl = sourceLang || 'auto';
        const tl = targetLang || 'en';

        // Using Google Translate free API for straightforward, zero-auth translation
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Translation API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Google Translate API returns a nested array where the first element contains segments
        let translatedText = '';
        if (data && data[0]) {
            data[0].forEach((segment: any) => {
                if (segment[0]) translatedText += segment[0];
            });
        }

        return NextResponse.json({
            original: text,
            translatedText: translatedText || text,
            sourceLang: sl,
            targetLang: tl
        });
    } catch (error: any) {
        console.error("Translation error:", error);
        return NextResponse.json({ error: error.message || "Failed to translate" }, { status: 500 });
    }
}
