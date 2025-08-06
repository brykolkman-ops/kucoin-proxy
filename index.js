require('dotenv').config();
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());

app.post('/kucoin', async (req, res) => {
  try {
    const { endpoint, method, data } = req.body;

    const timestamp = Date.now().toString();
    const baseUrl = 'https://api.kucoin.com';
    const url = `${baseUrl}${endpoint}`;
    const body = data && Object.keys(data).length > 0 ? JSON.stringify(data) : '';
    const prehash = timestamp + method.toUpperCase() + endpoint + body;

    const signature = crypto
      .createHmac('sha256', process.env.KUCOIN_API_SECRET)
      .update(prehash)
      .digest('base64');

    const kucoinResponse = await axios({
      method: method,
      url: url,
      headers: {
        'KC-API-KEY': process.env.KUCOIN_API_KEY,
        'KC-API-SIGN': signature,
        'KC-API-TIMESTAMP': timestamp,
        'KC-API-PASSPHRASE': process.env.KUCOIN_API_PASSPHRASE,
        'KC-API-KEY-VERSION': '2',
        'Content-Type': 'application/json'
      },
      data: data
    });

    res.json(kucoinResponse.data);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`✅ KuCoin proxy live on port ${port}`);
});
