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
    res.json(kucoinRes.data);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.listen(port, () => {
  console.log(`Proxy listening on port ${port}`);
});
