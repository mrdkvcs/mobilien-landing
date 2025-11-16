import { NextRequest, NextResponse } from 'next/server';

const OPENAI_WHISPER_URL = 'https://api.openai.com/v1/audio/transcriptions';
const WHISPER_MODEL = 'whisper-1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audioData, audioFormat, sessionId } = body as {
      audioData?: string;
      audioFormat?: string;
      sessionId?: string;
    };

    if (!audioData || !audioFormat) {
      console.error('❌ Missing audioData or audioFormat');
      return NextResponse.json({ error: 'Audio data and format required' }, { status: 400 });
    }

    console.log('🎤 Audio received, processing with OpenAI Whisper...');
    console.log('🔑 OPEN_AI_KEY available:', !!process.env.OPEN_AI_KEY);
    console.log('🔑 OPEN_AI_KEY length:', process.env.OPEN_AI_KEY?.length || 0);
    console.log('📊 Audio format:', audioFormat);
    console.log('📦 Audio data length:', audioData?.length || 0);

    const OPEN_AI_KEY = process.env.OPEN_AI_KEY;
    if (!OPEN_AI_KEY) {
      console.error('❌ OPEN_AI_KEY is missing in environment variables!');
      return NextResponse.json({ error: 'OPEN_AI_KEY not configured on server' }, { status: 500 });
    }

    // Step 1: Audio → Szöveg konverzió OpenAI Whisper API-val
    const audioBuffer = Buffer.from(audioData, 'base64');
    
    console.log('📤 Sending to OpenAI Whisper API...');
    console.log('📦 Audio buffer size:', audioBuffer.length, 'bytes');

    // FormData létrehozása a Whisper API-hoz
    const formData = new FormData();
    const audioBlob = new Blob([audioBuffer], { type: `audio/${audioFormat}` });
    formData.append('file', audioBlob, `audio.${audioFormat}`);
    formData.append('model', WHISPER_MODEL);
    formData.append('language', 'hu'); // Magyar nyelv

    console.log('📤 FormData created:');
    console.log('  - file:', `audio.${audioFormat}`);
    console.log('  - model:', WHISPER_MODEL);
    console.log('  - language: hu');

    const audioResponse = await fetch(OPENAI_WHISPER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPEN_AI_KEY}`
      },
      body: formData
    });

    console.log('📥 Whisper API response status:', audioResponse.status);

    if (!audioResponse.ok) {
      const errorText = await audioResponse.text();
      console.error('❌ OpenAI Whisper error:', errorText);
      return NextResponse.json({ error: `Audio processing failed: ${audioResponse.status}` }, { status: 500 });
    }

    const audioData_result = await audioResponse.json();
    const transcribedText = audioData_result.text || '';

    if (!transcribedText.trim()) {
      console.error('❌ Whisper returned empty text');
      return NextResponse.json({ error: 'Could not transcribe audio' }, { status: 500 });
    }

    console.log('✅ Audio transcribed by Whisper:', transcribedText);

    // Step 2: Átadjuk a transcribed szöveget a Chat API-nak (Agent backend)
    const CHAT_API_URL = 'https://api.mobilien.app/api/chat';
    
    console.log('🔗 Sending transcribed text to Chat API:', CHAT_API_URL);

    const chatResponse = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: transcribedText,
        sessionId: sessionId || undefined
      })
    });

    console.log('📥 Chat API response status:', chatResponse.status);

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error('❌ Chat API error:', errorText);
      return NextResponse.json({ error: `Chat API failed: ${chatResponse.status}` }, { status: 500 });
    }

    const chatData = await chatResponse.json();
    console.log('✅ Chat API response received');

    // Step 3: Visszaküldjük a backend válaszát + a transcribed text-et
    return NextResponse.json({
      reply: chatData.reply,
      sessionId: chatData.sessionId,
      transcribedText: transcribedText // Debug célra
    });

  } catch (error) {
    console.error('Audio chat API error:', error);
    return NextResponse.json({ error: 'Hiba történt az audio feldolgozása során.' }, { status: 500 });
  }
}

