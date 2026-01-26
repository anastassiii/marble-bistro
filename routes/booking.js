const express = require('express');
const router = express.Router();
const { sendBookingMessage } = require('../services/telegram');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // для уникальных ID

const bookingsFile = path.join(__dirname, '../data/bookings.json');

// Загружаем брони в файл
function loadBookings() {
    if (!fs.existsSync(bookingsFile)) return [];  // синхронно проверяет, существует ли файл по пути bookingsFile. Если файла нет (например, при первом запуске проекта), мы возвращаем пустой массив, чтобы не падал код при JSON.parse.
    const data = fs.readFileSync(bookingsFile, 'utf-8'); // синхронно читает содержимое файла и возвращает строку.
    return JSON.parse(data); // Строка из файла (data) в формате JSON превращается в JavaScript объект/массив.
}

// Сохраняем брони в файл
function saveBookings(bookings) {
    fs.writeFileSync(bookingsFile, JSON.stringify(bookings, null, 2)) // превращает объект JS в строку JSON
}

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

        const bookings = loadBookings();
        const booking = {
            id: uuidv4(),
            ...data,
            status: 'pending'
        }

        bookings.push(booking);
        saveBookings(bookings);

        await sendBookingMessage(booking); // Отправка уведомления в Telegram

        res,json({ status: 'ok', bookingID: booking.id }) // Если всё прошло успешно, клиент получает status: "ok" и уникальный bookingId.
    } catch (e) {
        console.error(e);
        res.status(500).json({ status: 'error', message: e.message })
    }
})

// === GET /booking/booked ===
router.get('/booked', (req, res) => {
    const bookings = loadBookings();
    const confirmed = bookings
        .filter(b => b.status === 'confirmed') // Мы оставляем только те брони, где status === 'confirmed'.
        .map(b => ({ date: b.date, time: b.time })) // После фильтрации мы создаем новый массив объектов, оставляя только дату и время.

    res.json(confirmed)
})

module.exports = router;