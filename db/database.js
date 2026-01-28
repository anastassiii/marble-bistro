const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'booking.db');
const db = new Database(dbPath);

// Создание таблицы бронирований
db.prepare(`
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        guests INTEGER NOT NULL,
        status TEXT NOT NULL
    )
`).run()

module.exports = db;