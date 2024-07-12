const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const secretRoutes = require('./routes/secretRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/api', secretRoutes);

// Serving static files
app.use(express.static(path.join(__dirname, '../public')));

// Serving main  rout for fronted UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 443;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
