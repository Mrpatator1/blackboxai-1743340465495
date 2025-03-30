const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialisation de la BDD
const db = new sqlite3.Database('./train.db', (err) => {
    if (err) console.error(err.message);
    console.log('Connected to SQLite database.');
});

// Création des tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS stations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS trains (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        number TEXT NOT NULL,
        time TEXT NOT NULL,
        type TEXT NOT NULL,
        platform TEXT,
        status TEXT DEFAULT 'on-time',
        delay TEXT,
        station_id INTEGER,
        origin TEXT,
        destination TEXT,
        FOREIGN KEY(station_id) REFERENCES stations(id)
    )`);
});

// Routes API
app.get('/api/stations', (req, res) => {
    db.all('SELECT * FROM stations', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/stations', (req, res) => {
    const { name } = req.body;
    db.run('INSERT INTO stations (name) VALUES (?)', [name], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

app.post('/api/trains', (req, res) => {
    const { number, time, type, platform, station_id, origin, destination } = req.body;
    db.run(
        'INSERT INTO trains (number, time, type, platform, station_id, origin, destination) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [number, time, type, platform, station_id, origin, destination],
        function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ id: this.lastID });
        }
    );
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const fs = require('fs');
const path = require('path');

// Route pour sauvegarder les trains
app.post('/save-trains', (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'trains.json');
    fs.writeFileSync(dataPath, JSON.stringify({ trains: req.body.trains }, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur de sauvegarde' });
  }
});