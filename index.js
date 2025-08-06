require('dotenv').config();
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const { google } = require('googleapis');

const app = express();
const port = process.env.PORT || 3000;

// 🔐 KuCoin credentials from .env
const KUCOIN_API_KEY = process.env.KUCOIN_API_KEY;
const KUCOIN_API_SECRET = process.env.KUCOIN_API_SECRET;
const KUCOIN_API_PASSPHRASE = process.env.KUCOIN_API_PASSPHRASE;

// ✅ Google Sheet credentials from .env
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

// 🔄 Get KuCoin account balances
async function fetchKucoinBalances() {
  const url = 'https://api.kucoin.com/api/v1/accounts';
  const now = Date.now();
  const method = 'GET';
  const endpoint = '/api/v1/accounts';
  const strToSign = now + method + endpoint;
  const signature = crypto
    .createHmac('sha256', KUCOIN_API_SECRET)
    .update(strToSign)
    .digest('base64');

  try {
    const response = await axios.get(url, {
      headers: {
        'KC-API-KEY': KUCOIN_API_KEY,
        'KC-API-SIGN': signature,
        'KC-API-TIMESTAMP': now,
        'KC-API-PASSPHRASE': KUCOIN_API_PASSPHRASE,
        'KC-API-KEY-VERSION': '2',
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('KuCoin API error:', error.response?.data || error.message);
    return [];
  }
}

// 🧾 Write balances to Google Sheet
async function writeToGoogleSheet(dataRows) {
  const auth = new google.auth.JWT(
    GOOGLE_CLIENT_EMAIL,
    null,
    GOOGLE_PRIVATE_KEY,
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  const sheets = google.sheets({ version: 'v4', auth });

  const rows = dataRows.map(row => [
    new Date().toISOString().split('T')[0], // Datum
    row.currency,
    row.type || '', // Kolom voor bot-type (optioneel)
    row.balance,
    row.holds,
    'Actief',
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: 'Sheet1!A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: rows,
    },
  });

  console.log(`📄 ${rows.length} rijen weggeschreven naar Google Sheet.`);
}

// 🌐 API endpoint
app.get('/balances', async (req, res) => {
  const balances = await fetchKucoinBalances();

  try {
    await writeToGoogleSheet(balances);
    console.log('✅ Data ook naar Google Sheets geschreven.');
  } catch (err) {
    console.error('❌ Google Sheets fout:', err.message);
  }

  res.json(balances);
});

app.listen(port, () => {
  console.log(`🚀 Proxy server draait op poort ${port}`);
});
