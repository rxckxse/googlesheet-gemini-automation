# Google Sheets migration

This folder contains the smallest possible Sheets migration path:

- Keep the existing Next.js Gemini backend.
- Add a Google Apps Script custom function that calls the backend.
- Use a simple Sheets sidebar for instructions/settings.

## What to change

1. Deploy the Next.js app somewhere Google Sheets can reach over HTTPS.
2. Replace `API_BASE_URL` in `Code.gs`.
3. Paste `Code.gs` and `Sidebar.html` into a bound Apps Script project for the spreadsheet.
4. Reload the sheet and use `=GEMINI_ASK(A1)`.

## Why this is the least-change option

- No rewrite of your Gemini API logic.
- No Excel/Office add-in manifest.
- No separate frontend needed for the first working version.
