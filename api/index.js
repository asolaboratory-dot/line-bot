const crypto = require('crypto');
const https = require('https');

const CHANNEL_SECRET = process.env.CHANNEL_SECRET;
const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

const STAFF = {
  'omura': '代表 大村',
  'kidokoro': 'マネージャー 城所',
  'hirakimoto': 'スタッフ 開本'
};

function replyMessage(replyToken, text) {
  const body = JSON.stringify({
    replyToken,
    messages: [{ type: 'text', text }]
  });
  const options = {
    hostname: 'api.line.me',
    path: '/v2/bot/message/reply',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
    }
  };
  return new Promise((resolve) => {
    const req = https.request(options, resolve);
    req.write(body);
    req.end();
  });
}

module.exports = async (req, res) => {
  if (req.method === 'GET') return res.status(200).send('OK');

  const signature = req.headers['x-line-signature'];
  const rawBody = await new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
  });

  const hmac = crypto.createHmac('sha256', CHANNEL_SECRET);
  hmac.update(rawBody);
  if (signature !== hmac.digest('base64')) return res.status(401).send('Unauthorized');

  res.status(200).send('OK');

  const events = JSON.parse(rawBody).events || [];
  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const match = event.message.text.match(/^\/担当:(\S+)\s+([\s\S]+)$/);
      if
