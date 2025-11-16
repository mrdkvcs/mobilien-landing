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
      return NextResponse.json({ error: 'Audio data and format required' }, { status: 400 });
    }

    const OPEN_AI_KEY = process.env.OPEN_AI_KEY;
    if (!OPEN_AI_KEY) {
      return NextResponse.json({ error: 'OPEN_AI_KEY not configured on server' }, { status: 500 });
    }

    // Step 1: Audio → Szöveg konverzió OpenAI Whisper API-val
    const audioBuffer = Buffer.from(audioData, 'base64');

    // FormData létrehozása a Whisper API-hoz
    const formData = new FormData();
    const audioBlob = new Blob([audioBuffer], { type: `audio/${audioFormat}` });
    formData.append('file', audioBlob, `audio.${audioFormat}`);
    formData.append('model', WHISPER_MODEL);
    formData.append('language', 'hu');

    const audioResponse = await fetch(OPENAI_WHISPER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPEN_AI_KEY}`
      },
      body: formData
    });

    if (!audioResponse.ok) {
      const errorText = await audioResponse.text();
      console.error('OpenAI Whisper error:', errorText);
      return NextResponse.json({ error: `Audio processing failed: ${audioResponse.status}` }, { status: 500 });
    }

    const audioData_result = await audioResponse.json();
    const transcribedText = audioData_result.text || '';

    if (!transcribedText.trim()) {
      return NextResponse.json({ error: 'Could not transcribe audio' }, { status: 500 });
    }

    // Step 2: Átadjuk a transcribed szöveget a Chat API-nak (Agent backend)
    const CHAT_API_URL = 'https://api.mobilien.app/api/chat';

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

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error('Chat API error:', errorText);
      return NextResponse.json({ error: `Chat API failed: ${chatResponse.status}` }, { status: 500 });
    }

    const chatData = await chatResponse.json();

    // Step 3: Visszaküldjük a backend válaszát + a transcribed text-et
    return NextResponse.json({
      reply: chatData.reply,
      sessionId: chatData.sessionId,
      transcribedText: transcribedText
    });

  } catch (error) {
    console.error('Audio chat API error:', error);
    return NextResponse.json({ error: 'Hiba történt az audio feldolgozása során.' }, { status: 500 });
  }
}

