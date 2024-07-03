const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.put('/update', (req, res) => {
    const updateData = req.body;

    // Load current data from data.json
    const dataPath = path.join(__dirname, 'public/data.json');
    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data file:', err);
            return res.status(500).json({ error: 'Error reading data file.' });
        }

        try {
            const jsonData = JSON.parse(data);

            // Update player1's Elo rating
            const player1 = jsonData.brother.find(player => player.name === updateData.player1.name);
            if (player1) {
                player1.elo = updateData.player1.elo;
            } else {
                return res.status(404).json({ error: 'Player 1 not found.' });
            }

            // Update player2's Elo rating
            const player2 = jsonData.brother.find(player => player.name === updateData.player2.name);
            if (player2) {
                player2.elo = updateData.player2.elo;
            } else {
                return res.status(404).json({ error: 'Player 2 not found.' });
            }

            // Write updated data back to data.json
            fs.writeFile(dataPath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error('Error writing data file:', err);
                    return res.status(500).json({ error: 'Error writing data file.' });
                }

                console.log('Elo ratings updated successfully');
                res.json({ success: true, message: 'Elo ratings updated successfully.' });
            });
            
        } catch (error) {
            console.error('Error parsing JSON:', error);
            res.status(500).json({ error: 'Error parsing JSON data.' });
        }
    });
});


app.post('/add-player', (req, res) => {
    const newPlayer = req.body;
    const filePath = path.join(__dirname, 'public/data.json');

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading data file:', err);
            return res.json({ success: false, message: 'Error reading data file.' });
        }

        const jsonData = JSON.parse(data);
        const playerExists = jsonData.brother.some(player => player.name === newPlayer.name);

        if (playerExists) {
            return res.json({ success: false, message: 'Name is already in use.' });
        }

        jsonData.brother.push(newPlayer);

        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                console.error('Error writing data file:', err);
                return res.json({ success: false, message: 'Error writing data file.' });
            }

            res.json({ success: true, message: 'Player successfully added.' });
        });
    });
});

app.get('/rankings', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'rankings.html'));
});

// Route to fetch player data sorted by Elo
app.get('/players', (req, res) => {
    const filePath = path.join(__dirname, 'public/data.json');

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading data file:', err);
            return res.json({ success: false, message: 'Error reading data file.' });
        }

        const jsonData = JSON.parse(data);

        // Sort players by Elo in descending order
        jsonData.brother.sort((a, b) => b.elo - a.elo);

        res.json(jsonData.brother);
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
