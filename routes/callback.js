const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { editBookingStatus } = require('../services/telegram');

const bookingsFile = path.join(__dirname, '../data/bookings.json');

function loadBookings() {
    if (!fs.existsSync(bookingsFile)) return [];
    const data = fs.readFileSync(bookingsFile, 'utf-8');
    return JSON.parse(data)
}

function saveBookings(bookings) {
  fs.writeFileSync(bookingsFile, JSON.stringify(bookings, null, 2));
}

// === POST /callback ===
router.post('/', async (req, res) => {
  try {
    const query = req.body.callback_query;
    if (!query) return res.sendStatus(200);

    const [action, id] = query.data.split('_');
    const bookings = loadBookings();
    const booking = bookings.find(b => b.id === id);

    if (!booking) return res.sendStatus(200);

    booking.status = action === 'confirm'
      ? 'confirmed'
      : 'cancelled';

    saveBookings(bookings);

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