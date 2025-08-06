const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/kucoin', async (req, res) => {
  try {
    const kucoinUrl = 'https://api.kucoin.com' + req.body.endpoint;
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

// Alleen 'data' meesturen bij POST/PUT/etc.
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
