require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());

app.post('/kucoin', async (req, res) => {
  try {
    const { endpoint, method, data } = req.body;

    const kucoinResponse = await axios({
      method: method,
      url: `https://api.kucoin.com${endpoint}`,
      headers: {
        'KC-API-KEY': process.env.KUCOIN_API_KEY,
        'KC-API-SECRET': process.env.KUCOIN_API_SECRET,
        'KC-API-PASSPHRASE': process.env.KUCOIN_API_PASSPHRASE,
        'KC-API-SIGN': 'hier komt de signature (of placeholder)',
        'KC-API-TIMESTAMP': Date.now().toString(),
        'KC-API-KEY-VERSION': '2'
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
