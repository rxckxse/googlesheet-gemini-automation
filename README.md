# Google Sheets Gemini automation

This project exposes a Next.js backend for a Google Sheets custom function.

## Flow

1. Google Sheets calls `=GEMINI_ASK(A2)`.
2. `sheets/Code.gs` sends `{ text }` to `/api/gemini`.
3. The backend adds the saved system prompt from `/api/config` or `GEMINI_SYSTEM_INSTRUCTION`.
4. The backend calls Gemini and returns the generated text.

## Setup

1. Set `GEMINI_API_KEY` in the Next.js server environment.
2. Deploy the app to an HTTPS URL Google Sheets can reach.
3. Update `API_BASE_URL` in `sheets/Code.gs` if the deployment URL changes.
4. In Google Sheets, open Extensions > Apps Script and paste `sheets/Code.gs`.
5. Save, reload the sheet, and use `=GEMINI_ASK(A2)`.

The formula accepts one required argument only: the input text or cell reference.