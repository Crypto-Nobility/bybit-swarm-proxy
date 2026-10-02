const express = require('express');
const app = express();

app.use(express.json());

app.all('/*', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const targetHost = process.env.TARGET_HOST || 'https://api.bybit.com';
  const targetUrl = `${targetHost}${req.url}`;

  const targetHeaders = new Headers();

  const allowedHeaders = ['x-bapi-api-key', 'x-bapi-timestamp', 'x-bapi-sign', 'x-bapi-recv-window', 'x-mbx-apikey', 'content-type'];
  allowedHeaders.forEach(key => {
    if (req.headers[key]) targetHeaders.set(key, req.headers[key]);
  });

  targetHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  const options = {
    method: req.method,
    headers: targetHeaders,
  };

  if (req.method === 'POST' || req.method === 'PUT') {
    options.body = JSON.stringify(req.body);
  }

  try {
    const response = await fetch(targetUrl, options);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy Request Failed', details: error.message });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`SWARM Proxy active on port ${PORT}`));
