const express = require('express');
const router = express.Router();
const { sendBookingMessage } = require('../services/telegram');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // для уникальных ID
const db = require('../db/database')

// Валидация простой
function validateBooking(data) {
    const { name, phone, date, time, guests } = data;
    if (!name || !phone || !date || !time || !guests) return false;
    return true
}

// === POST /booking ===
router.post('/', async (req, res) => {
    try {
        const data = req.body;

        if (!validateBooking(data)) {
            return res.status(400).json({ status: 'error', message: 'Некорректные данные' })
        }

        const booking = {
        name: data.name,
        phone: data.phone,
        date: data.date,
        time: data.time,
        guests: data.guests,
        status: 'NEW'
        };

        const stmt = db.prepare(`
        INSERT INTO bookings (name, phone, date, time, guests, status)
        VALUES (@name, @phone, @date, @time, @guests, @status)
        `);

        const result = stmt.run(booking);
        booking.id = result.lastInsertRowid;

        await sendBookingMessage(booking);

        res.json({ status: 'ok', bookingId: booking.id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ status: 'error', message: e.message })
    }
})

// === GET /booking/booked ===
router.get('/booked', (req, res) => {
    const stmt = db.prepare(`
    SELECT date, time FROM bookings WHERE status = 'CONFIRMED'
  `);
  const confirmedSlots = stmt.all();
  res.json(confirmedSlots);
})

module.exports = router;