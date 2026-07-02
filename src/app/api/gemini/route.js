import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const ALLOWED_ORIGINS = new Set([
  'https://localhost:3000',
  'http://localhost:3000',
]);
const MAX_TEXT_LENGTH = 20000;
const MAX_SYSTEM_INSTRUCTION_LENGTH = 4000;
const DEFAULT_SYSTEM_INSTRUCTION = process.env.GEMINI_SYSTEM_INSTRUCTION || '';

function getCorsHeaders(request) {
  const origin = request.headers.get('origin');
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin)
    ? origin
    : 'https://localhost:3000';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function getSavedSystemInstruction() {
  return globalThis.geminiConfig?.systemInstruction || DEFAULT_SYSTEM_INSTRUCTION;
}

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

export async function POST(request) {
  const corsHeaders = getCorsHeaders(request);

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY environment variable is not configured on the server.' },
        { status: 500, headers: corsHeaders }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Request body must be valid JSON.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { text } = body;

    if (typeof text !== 'string' || text.trim() === '') {
      return NextResponse.json(
        { error: 'Missing required input parameter: text' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text input must be ${MAX_TEXT_LENGTH} characters or fewer.` },
        { status: 413, headers: corsHeaders }
      );
    }

    const systemInstruction = getSavedSystemInstruction();
    if (systemInstruction.length > MAX_SYSTEM_INSTRUCTION_LENGTH) {
      return NextResponse.json(
        { error: `Saved system instruction must be ${MAX_SYSTEM_INSTRUCTION_LENGTH} characters or fewer.` },
        { status: 413, headers: corsHeaders }
      );
    }

    const config = {};
    if (systemInstruction.trim() !== '') {
      config.systemInstruction = systemInstruction;
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: text.trim(),
      config,
    });

    return NextResponse.json(
      { result: response.text || '' },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Gemini API Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}