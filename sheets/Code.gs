const DEFAULT_MODEL = 'gemini-3.5-flash';
const ALLOWED_MODELS = new Set([
  DEFAULT_MODEL,
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
]);
const API_BASE_URL = 'https://googlesheet-gemini-automation.vercel.app/';
const DEFAULT_SYSTEM_INSTRUCTION = 'Analyze the input and return the result according to the prompt configuration.';


/**
 * Google Sheets custom function.
 * @customfunction
 */
function GEMINI_ASK(text, systemInstruction, model) {
  const prompt = String(text ?? '').trim();
  if (!prompt) return '';

  const payload = {
    text: prompt,
    systemInstruction: String(systemInstruction ?? DEFAULT_SYSTEM_INSTRUCTION),
    model: normalizeModel(model),
  };

  const response = UrlFetchApp.fetch(`${API_BASE_URL}/api/gemini`, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  const status = response.getResponseCode();
  const body = response.getContentText();

  if (status < 200 || status >= 300) {
    try {
      const parsed = JSON.parse(body);
      throw new Error(parsed.error || `Gemini request failed (${status})`);
    } catch (err) {
      throw new Error(`Gemini request failed (${status}): ${body}`);
    }
  }

  const data = JSON.parse(body);
  return data.result || '';
}

function normalizeModel(model) {
  const value = String(model ?? '').trim();
  if (!value) return DEFAULT_MODEL;
  if (!ALLOWED_MODELS.has(value)) return DEFAULT_MODEL;
  return value;
}
