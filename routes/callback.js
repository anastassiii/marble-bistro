const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { editBookingStatus } = require('../services/telegram');
const db = require('../db/database')

// === POST /callback ===
router.post('/', async (req, res) => {
  try {
    const query = req.body.callback_query;
    if (!query) return res.sendStatus(200);

    const [action, id] = query.data.split('_');
    const bookingId = parseInt(id, 10);
  
    // Находим бронь
    const booking = db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(bookingId);
    if (!booking) return res.sendStatus(200)
    
    // Обновляем статус
    const newStatus = action === 'confirm' ? 'CONFIRMED' : 'CANCELED';
    db.prepare(`UPDATE bookings SET status = ? WHERE id = ?`).run(newStatus, bookingId);

    booking.status = newStatus;
    
    await editBookingStatus(
      query.message.chat.id,
      query.message.message_id,
      booking
    );

    res.sendStatus(200);
  } catch (e) {
    console.error('Callback error:', e.message);
    res.sendStatus(200); // Telegram не любит 500
  }
});

module.exports = router;