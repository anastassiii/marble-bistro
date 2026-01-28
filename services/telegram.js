const fetch = require('node-fetch');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// ==========================
// Отправка новой брони
// ==========================
async function sendBookingMessage(booking) {
  const text =
`📅 Новая бронь
🆔 ID: ${booking.id}

👤 Имя: ${booking.name}
📞 Телефон: ${booking.phone}
📆 Дата: ${booking.date}
⏰ Время: ${booking.time}
👥 Гостей: ${booking.guests}

Статус: ⏳ Ожидает подтверждения`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ Подтвердить', callback_data: `confirm_${booking.id}` },
        { text: '❌ Отменить', callback_data: `cancel_${booking.id}` }
      ]
    ]
  };

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      reply_markup: keyboard
    })
  });
}

// ==========================
// Редактирование статуса
// ==========================
async function editBookingStatus(chatId, messageId, booking) {
  const statusText =
    booking.status === 'CONFIRMED'
      ? '✅ Подтверждена'
      : '❌ Отменена';

  const text =
`📅 Бронь обновлена

👤 Имя: ${booking.name}
📞 Телефон: ${booking.phone}
📆 Дата: ${booking.date}
⏰ Время: ${booking.time}
👥 Гостей: ${booking.guests}

Статус: ${statusText}`;

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text
    })
  });
}

module.exports = {
  sendBookingMessage,
  editBookingStatus
};
