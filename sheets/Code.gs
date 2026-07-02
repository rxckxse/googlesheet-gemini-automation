const API_BASE_URL = 'https://googlesheet-gemini-automation.vercel.app';

/**
 * Sends one input value to the Next.js Gemini backend.
 * The backend applies the saved app prompt before calling Gemini.
 *
 * @param {string} text Input text or a cell reference.
 * @return Gemini response text.
 * @customfunction
 */
function GEMINI_ASK(text) {
  const prompt = String(text ?? '').trim();
  if (!prompt) return '';

  const response = UrlFetchApp.fetch(`${API_BASE_URL}/api/gemini`, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ text: prompt }),
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