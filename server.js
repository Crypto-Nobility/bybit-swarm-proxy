const express = require('express');
const app = express();

app.use(express.json());

app.all('/*', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Bybit 메인 서버로 경로 완벽 라우팅
  const targetUrl = `https://api.bybit.com${req.url}`;
  
  const targetHeaders = new Headers();
  
  // 구글 IP 흔적은 완벽히 차단하고, API 서명에 필수적인 암호화 헤더만 통과시킴
  const allowedHeaders = ['x-bapi-api-key', 'x-bapi-timestamp', 'x-bapi-sign', 'x-bapi-recv-window', 'content-type'];
  allowedHeaders.forEach(key => {
    if (req.headers[key]) targetHeaders.set(key, req.headers[key]);
  });
  
  // 봇 차단을 피하기 위해 평범한 윈도우 크롬 브라우저로 위장
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
