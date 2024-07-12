const express = require('express');
const router = express.Router();
const Secret = require('../models/secret');
const bodyParser = require('body-parser');
const xml = require('xml');
const generateHash = require('../utils/hashGenerator'); // Helyes importálás

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Middleware to handle Accept header
router.use((req, res, next) => {
    res.format({
        'application/json': () => {
            res.setHeader('Content-Type', 'application/json');
            next();
        },
        'application/xml': () => {
            res.setHeader('Content-Type', 'application/xml');
            next();
        },
        'default': () => {
            res.status(406).send('Not Acceptable');
        }
    });
});

// Post végpont titok létrehozásához
router.post('/secret', async (req, res) => {
    const { secretText, expireAfterViews, expireAfter } = req.body;
    const hash = generateHash(); // Generálás
    try {
        const expiresAt = new Date(new Date().getTime() + expireAfter * 60000); // TTL in minutes
        const secretData = await Secret.create({
            hash,
            secretText,
            remainingViews: expireAfterViews,
            expiresAt
        });

        const response = { hash: hash, secretText: secretData.secretText, createdAt: secretData.createdAt, expiresAt: secretData.expiresAt, remainingViews: secretData.remainingViews };
        res.status(200).format({
            'application/json': () => res.json(response),
            'application/xml': () => res.send(xml({ secret: response }))
        });
    } catch (err) {
        console.error(err); // Logoljuk a hibát
        const errorResponse = { error: 'Failed to create secret' };
        res.status(500).format({
            'application/json': () => res.json(errorResponse),
            'application/xml': () => res.send(xml(errorResponse))
        });
    }
});

// Get endpoint titok lekérésére
router.get('/secret/:hash', async (req, res) => {
    const { hash } = req.params;
    try {
        const secret = await Secret.findOne({ where: { hash } });
        if (!secret) {
            const errorResponse = { error: 'Secret not found' };
            return res.status(404).format({
                'application/json': () => res.json(errorResponse),
                'application/xml': () => res.send(xml(errorResponse))
            });
        }

        const currentTime = new Date();
        const expiryTime = new Date(secret.expiresAt);

        if (currentTime > expiryTime || secret.remainingViews <= 0) {
            const errorResponse = { error: 'Secret has expired or reached read limit' };
            return res.status(410).format({
                'application/json': () => res.json(errorResponse),
                'application/xml': () => res.send(xml(errorResponse))
            });
        }

        secret.remainingViews -= 1;
        await secret.save();

        const response = { secretText: secret.secretText };
        res.status(200).format({
            'application/json': () => res.json(response),
            'application/xml': () => res.send(xml(response))
        });
    } catch (err) {
        console.error(err); // Logoljuk a hibát
        const errorResponse = { error: 'Failed to retrieve secret' };
        res.status(500).format({
            'application/json': () => res.json(errorResponse),
            'application/xml': () => res.send(xml(errorResponse))
        });
    }
});

module.exports = router;
