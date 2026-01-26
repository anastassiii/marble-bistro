require('dotenv').config();
const express = require('express');
const path = require('path');
const localtunnel = require('localtunnel');

//Роуты
const bookingRouter = require('./routes/booking');
const callbackRouter = require('./routes/callback');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({limit: '10kb'})); //защита от слишком больших payload
app.use(express.static(path.join(__dirname, 'public')));

// === Роуты ===
app.use('/booking', bookingRouter);
app.use('/callback', callbackRouter);

// ==================
// Главная страница
// ==================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === Запуск сервера с localtunnel ===

(async () => {
  const server = app.listen(PORT, async () => {
    console.log(`Server running at http://localhost:${PORT}`);

    const tunnel = await localtunnel({ port: PORT});
    console.log(`Public URL: ${tunnel.url}`); //localtunnel создаёт публичный URL для локального сервера

    const webhookUrl = `${tunnel.url}/callback`; //Формируем URL для webhook

    const result = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/setWebhook`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl })
      }
    ).then(r => r.json()); // Устанавливаем webhook в Telegram

    if (result.ok) {
      console.log(`✅ Webhook установлен: ${webhookUrl}`);
    } else {
      console.log('❌ Ошибка webhook:', result);
    }

    process.on('SIGINT', () => {
      tunnel.close();
      process.exit();
    }) //Обрабатываем закрытие сервера
  })
})