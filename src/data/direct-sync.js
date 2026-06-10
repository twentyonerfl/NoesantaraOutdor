/* eslint-disable */
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Load environment variables from .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      // Remove surrounding quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

if (!SPREADSHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
  console.error("Missing Google Sheets credentials in .env.local");
  process.exit(1);
}

const formattedKey = PRIVATE_KEY.replace(/\\n/g, '\n');

const auth = new google.auth.JWT({
  email: CLIENT_EMAIL,
  key: formattedKey,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

const dbPath = path.join(process.cwd(), 'src/data/db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const settingsHeaders = ["key", "value"];
const settingsRows = [
  ["address", db.settings.address],
  ["phone", db.settings.phone],
  ["email", db.settings.email],
  ["operatingHours", db.settings.operatingHours],
  ["cleanWarranty", db.settings.cleanWarranty],
  ["gmapsEmbedUrl", db.settings.gmapsEmbedUrl || ""],
];

const data = [settingsHeaders, ...settingsRows];

console.log("Synchronizing settings with Google Sheets... URL target:", db.settings.gmapsEmbedUrl);

sheets.spreadsheets.values.clear({
  spreadsheetId: SPREADSHEET_ID,
  range: 'settings!A:Z'
}).then(() => {
  return sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: 'settings!A1',
    valueInputOption: 'RAW',
    requestBody: { values: data }
  });
}).then(() => {
  console.log("SUCCESS: Settings successfully synced to Google Sheets!");
  process.exit(0);
}).catch(err => {
  console.error("ERROR syncing settings:", err);
  process.exit(1);
});
