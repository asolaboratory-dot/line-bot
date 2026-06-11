const express = require('express');
const crypto = require('crypto');
const axios = require('axios');

const app = express();

const CHANNEL_SECRET = process.env.CHANNEL_SECRET;
const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

const STAFF = {
  'omura': '代表 大村',
  'kidokoro': 'マネージャー 城所',
  'hirakimoto': 'スタッフ 開本'
};

app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf; }
}));

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-line-signature'];
  const hmac = crypto.createHmac('sha256', CHANNEL_SECRET);
  hmac.update(req.rawBody);
  const digest = hmac.digest('base64');
  if (signature !== digest) return res.status(401).send('Unauthorized');

  res.status(200).send('OK');

  const events = req.body.events || [];
  events.forEach(event => {
    if (event.type === 'message' &&
