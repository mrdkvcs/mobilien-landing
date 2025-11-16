import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const TEXT_MODEL = 'google/gemini-2.0-flash-exp:free';

interface FileData {
  name: string;
  type: string;
  size: number;
  data: string; // Base64 encoded
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, files, sessionId } = body as {
      message?: string;
      files?: FileData[];
      sessionId?: string;
    };

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    console.log('📎 Files received:', files.length);

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      console.error('❌ API_KEY is missing!');
      return NextResponse.json({ error: 'API_KEY not configured' }, { status: 500 });
    }

    // Step 1: Fájlok tartalmának dekódolása
    const fileContents: string[] = [];
    
    for (const file of files) {
      try {
        // Base64 → szöveg dekódolás
        const decodedContent = Buffer.from(file.data, 'base64').toString('utf-8');
        fileContents.push(`--- ${file.name} (${file.type}) ---\n${decodedContent}\n`);
        console.log(`✅ Decoded file: ${file.name}`);
      } catch (error) {
        console.error(`❌ Failed to decode file: ${file.name}`, error);
        fileContents.push(`--- ${file.name} ---\n[Unable to read file content]\n`);
      }
    }

    // Step 2: Prompt összeállítása
    const combinedContent = fileContents.join('\n');
    const fullPrompt = message
      ? `${message}\n\nCsatolt fájl(ok) tartalma:\n${combinedContent}`
      : `Kérlek, elemezd a következő fájl(ok) tartalmát:\n${combinedContent}`;

    // Step 3: OpenRouter API hívás
    const aiResponse = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mobilien.hu',
        'X-Title': 'Mobilien File Analysis'
      },
      body: JSON.stringify({
        model: TEXT_MODEL,
        messages: [
          {
            role: 'system',
            content: `Te Mobi vagy, a Mobilien e-mobilitási asszisztense. A felhasználó fájlokat csatolt, amelyeket elemezned kell és informatív, barátságos választ kell adnod magyarul.`
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ]
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('OpenRouter AI error:', errorText);
      return NextResponse.json({ error: `AI processing failed` }, { status: 500 });
    }

    const aiData = await aiResponse.json();
    const aiReply = aiData.choices?.[0]?.message?.content || 'Nem tudtam elemezni a fájlokat.';

    console.log('✅ AI response received');

    // Step 4: Session kezelés (opcionális)
    const responseSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      reply: aiReply,
      sessionId: responseSessionId
    });

  } catch (error) {
    console.error('File chat API error:', error);
    return NextResponse.json({ error: 'Hiba történt a fájlok feldolgozása során.' }, { status: 500 });
  }
}

