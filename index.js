const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.post('/kucoin', async (req, res) => {
  try {
    const { endpoint, method = 'GET', data = {} } = req.body;

    const now = Date.now().toString();
    const requestPath = endpoint;
    const body = method === 'GET' ? '' : JSON.stringify(data);
    const strToSign = now + method.toUpperCase() + requestPath + body;
    const signature = crypto
      .createHmac('sha256', process.env.KC_API_SECRET)
      .update(strToSign)
      .digest('base64');

    const passphrase = crypto
      .createHmac('sha256', process.env.KC_API_SECRET)
      .update(process.env.KC_API_PASSPHRASE)
      .digest('base64');

    const headers = {
      'KC-API-KEY': process.env.KC_API_KEY,
      'KC-API-SIGN': signature,
      'KC-API-TIMESTAMP': now,
      'KC-API-PASSPHRASE': passphrase,
      'KC-API-KEY-VERSION': '2',
      'Content-Type': 'application/json',
    };

    const kucoinResponse = await axios({
      method,
      url: `https://api.kucoin.com${endpoint}`,
      headers,
      data,
    });

    res.json(kucoinResponse.data);
  } catch (err) {
    console.error('Proxy error:', err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({
      error: err?.response?.data || err.message,
    });
  }
});

app.listen(port, () => {
  console.log(`✅ Proxy listening on port ${port}`);
});
