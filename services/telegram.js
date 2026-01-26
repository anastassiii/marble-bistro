const fetch = require('node-fetch');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

async function sendBookingMessage(booking) {
    const text = `
        📌 Новая бронь
        ID: ${booking.id}
        Имя: ${booking.name}
        Телефон: ${booking.phone}
        Дата: ${booking.date}
        Время: ${booking.time}
        Гостей: ${booking.guests}
    `;

    const keyboard = {
        reply_markup: {
            inline_keyboard: [[
                { text: '✅ Подтвердить', callback_data: `confirm_${booking.id}` },
                { text: '❌ Отменить', callback_data: `cancel_${booking.id}` }
            ]]
        }
    }

    const res = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, // Telegram Bot API endpoint для отправки сообщений
        {
            method: 'POST', //говорим, что мы отправляем данные
            headers: { 'Content-Type': 'application/json' }, // говорим серверу Telegram, что данные в формате JSON
            body: JSON.stringify({
                chat_id: CHAT_ID, //куда отправлять сообщение
                text, // текст сообщения
                ...keyboard // объект с кнопками (inline_keyboard)
            })
        }
    )

    const data = await res.json();
    if (!data.ok) throw new Error(data.description);
    return data;
}

async function editBookingStatus(chatId, messageId, booking) {
    const text = `📌 Бронь ID: ${booking.id}\nСтатус: ${booking.status.toUpperCase()}`;
    const res = await fetch (
        `https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`,
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                chat_id: chatId,
                message_id: messageId,
                text
            })
        }
    )
    
    const data = await res.json();
    if (!data.ok) throw new Error(data.description);
    return data;
}

module.exports = { sendBookingMessage }