import { NextResponse } from 'next/server';

const MAX_SYSTEM_INSTRUCTION_LENGTH = 4000;
const DEFAULT_SYSTEM_INSTRUCTION = process.env.GEMINI_SYSTEM_INSTRUCTION || '';
const ALLOWED_ORIGINS = new Set([
  'https://localhost:3000',
  'http://localhost:3000',
]);

function getCorsHeaders(request) {
  const origin = request.headers.get('origin');
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin)
    ? origin
    : 'https://localhost:3000';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function getConfig() {
  return globalThis.geminiConfig || {
    systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
  };
}

function saveConfig(config) {
  globalThis.geminiConfig = {
    ...getConfig(),
    ...config,
  };
  return globalThis.geminiConfig;
}

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

export async function GET(request) {
  return NextResponse.json(getConfig(), {
    status: 200,
    headers: getCorsHeaders(request),
  });
}

export async function POST(request) {
  const corsHeaders = getCorsHeaders(request);

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400, headers: corsHeaders }
    );
  }

  const systemInstruction = typeof body.systemInstruction === 'string'
    ? body.systemInstruction
    : '';

  if (systemInstruction.length > MAX_SYSTEM_INSTRUCTION_LENGTH) {
    return NextResponse.json(
      { error: `System instruction must be ${MAX_SYSTEM_INSTRUCTION_LENGTH} characters or fewer.` },
      { status: 413, headers: corsHeaders }
    );
  }

  return NextResponse.json(saveConfig({ systemInstruction }), {
    status: 200,
    headers: corsHeaders,
  });
}