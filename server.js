require('dotenv').config();
const express = require('express');
const path = require('path');
const localtunnel = require('localtunnel');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================
// Хранилище броней
// ==================
const bookings = [];

// ==================
// Главная страница
// ==================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================
// Создание брони
// ==================
app.post('/booking', async (req, res) => {
  try {
    const { name, phone, date, time, guests } = req.body;
    if (!name || !phone || !date || !time || !guests) {
      return res.json({ status: 'error', message: 'Некорректные данные' });
    }

    const bookingId = Date.now();
    const booking = {
      id: bookingId,
      name,
      phone,
      date,
      time,
      guests,
      status: 'pending'
    };

    bookings.push(booking);

    const text = `
📌 Новая бронь
ID: ${bookingId}
Имя: ${name}
Телефон: ${phone}
Дата: ${date}
Время: ${time}
Гостей: ${guests}
`;

    const keyboard = {
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Подтвердить', callback_data: `confirm_${bookingId}` },
          { text: '❌ Отменить', callback_data: `cancel_${bookingId}` }
        ]]
      }
    };

    const tgRes = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.CHAT_ID,
          text,
          ...keyboard
        })
      }
    ).then(r => r.json());

    if (!tgRes.ok) throw new Error(tgRes.description);

    res.json({ status: 'ok', bookingId });
  } catch (e) {
    console.error(e);
    res.json({ status: 'error', message: e.message });
  }
});

// ==================
// Callback Telegram
// ==================
app.post('/callback', async (req, res) => {
  const q = req.body.callback_query;
  if (!q) return res.sendStatus(200);

  const [action, id] = q.data.split('_');
  const booking = bookings.find(b => b.id == id);
  if (!booking) return res.sendStatus(200);

  booking.status = action === 'confirm' ? 'confirmed' : 'cancelled';

  await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: q.message.chat.id,
      message_id: q.message.message_id,
      text: `📌 Бронь ID: ${booking.id}\nСтатус: ${booking.status.toUpperCase()}`
    })
  });

  res.sendStatus(200);
});

// ==================
// Занятые слоты
// ==================
app.get('/booked', (req, res) => {
  res.json(
    bookings
      .filter(b => b.status === 'confirmed')
      .map(b => ({ date: b.date, time: b.time }))
  );
});

// ==================
// SERVER + LOCALTUNNEL + WEBHOOK
// ==================
(async () => {
  app.listen(PORT, async () => {
    console.log(`Server running at http://localhost:${PORT}`);

    const tunnel = await localtunnel({ port: PORT });
    console.log(`Public URL: ${tunnel.url}`);

    const webhookUrl = `${tunnel.url}/callback`;

    const result = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/setWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl })
      }
    ).then(r => r.json());

    if (result.ok) {
      console.log(`✅ Webhook установлен: ${webhookUrl}`);
    } else {
      console.error('❌ Ошибка webhook:', result);
    }

    process.on('SIGINT', () => {
      tunnel.close();
      process.exit();
    });
  });
})();
