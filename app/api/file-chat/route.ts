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
    console.log('📎 File-chat API called');
    const body = await request.json();
    const { message, files, sessionId } = body as {
      message?: string;
      files?: FileData[];
      sessionId?: string;
    };

    console.log('📦 Received data:', {
      message: message?.substring(0, 50),
      filesCount: files?.length,
      sessionId: sessionId?.substring(0, 20)
    });

    if (!files || files.length === 0) {
      console.error('❌ No files provided');
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    console.log('📎 Files received:', files.length);
    files.forEach((file, i) => {
      console.log(`  ${i + 1}. ${file.name} (${file.type}, ${file.size} bytes)`);
    });

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      console.error('❌ API_KEY is missing!');
      return NextResponse.json({ error: 'API_KEY not configured' }, { status: 500 });
    }
    
    console.log('✅ API_KEY available:', API_KEY.substring(0, 20) + '...');

    // Step 1: Fájlok tartalmának dekódolása
    const fileContents: string[] = [];
    
    for (const file of files) {
      try {
        console.log(`🔄 Decoding file: ${file.name}...`);
        // Base64 → szöveg dekódolás
        const decodedContent = Buffer.from(file.data, 'base64').toString('utf-8');
        const preview = decodedContent.substring(0, 100);
        console.log(`✅ Decoded file: ${file.name} (${decodedContent.length} chars)`);
        console.log(`   Preview: ${preview}...`);
        fileContents.push(`--- ${file.name} (${file.type}) ---\n${decodedContent}\n`);
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

    console.log(`📤 Sending to OpenRouter AI (prompt length: ${fullPrompt.length} chars)`);

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

    console.log('📥 OpenRouter response status:', aiResponse.status);

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ OpenRouter AI error:', errorText);
      return NextResponse.json({ error: `AI processing failed: ${aiResponse.status}` }, { status: 500 });
    }

    const aiData = await aiResponse.json();
    const aiReply = aiData.choices?.[0]?.message?.content || 'Nem tudtam elemezni a fájlokat.';

    console.log('✅ AI response received (length:', aiReply.length, 'chars)');

    // Step 4: Session kezelés (opcionális)
    const responseSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      reply: aiReply,
      sessionId: responseSessionId
    });

  } catch (error) {
    console.error('❌ File chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error details:', errorMessage);
    return NextResponse.json({ error: 'Hiba történt a fájlok feldolgozása során.' }, { status: 500 });
  }
}

