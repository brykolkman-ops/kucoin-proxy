console.log(process.env.XXX)
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());

app.post('/kucoin', async (req, res) => {
  try {
    const kucoinUrl = 'https://api.kucoin.com' + req.body.endpoint;

    if (!req.body.endpoint) {
      return res.status(400).json({ error: 'Missing required field: endpoint' });
    }

    // Log de environment-variabelen (alleen tijdelijk!)
    console.log('[DEBUG] Loaded env vars:', {
      KUCOIN_API_KEY: process.env.KUCOIN_API_KEY ? '[OK]' : '[MISSING]',
      KUCOIN_API_SECRET: process.env.KUCOIN_API_SECRET ? '[OK]' : '[MISSING]',
      KUCOIN_API_PASSPHRASE: process.env.KUCOIN_API_PASSPHRASE ? '[OK]' : '[MISSING]',
    });

    const headers = {
      'KC-API-KEY': process.env.KUCOIN_API_KEY,
      'KC-API-SECRET': process.env.KUCOIN_API_SECRET,
      'KC-API-PASSPHRASE': process.env.KUCOIN_API_PASSPHRASE,
      'KC-API-KEY-VERSION': '2',
      'Content-Type': 'application/json',
    };

    const axiosOptions = {
      method: req.body.method || 'GET',
      url: kucoinUrl,
      headers,
    };

    if (req.body.data && req.body.method !== 'GET') {
      axiosOptions.data = req.body.data;
    }

    const kucoinRes = await axios(axiosOptions);

    // Debug log van KuCoin response
    console.log('[DEBUG] KuCoin response:', kucoinRes.data);

    res.json(kucoinRes.data);
  } catch (err) {
    console.error('[ERROR] KuCoin proxy error:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });

    res.status(500).json({
      error: 'Proxy error',
      detail: err.message,
      kucoin: err.response?.data || null,
    });
  }
});

app.listen(port, () => {
  console.log(`KuCoin proxy is running on port ${port}`);
});
