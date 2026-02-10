const express = require('express');
const router = express.Router();
const multer = require('multer');
const Media = require('../models/Media');

// Use memory storage to avoid files on disk
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// GET image by ID
router.get('/:id', async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        if (!media) {
            return res.status(404).send('Image not found');
        }
        res.set('Content-Type', media.contentType);
        res.send(media.data);
    } catch (err) {
        res.status(500).send('Error retrieving image');
    }
});

// POST upload new image
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const newMedia = new Media({
            filename: req.file.originalname,
            data: req.file.buffer,
            contentType: req.file.mimetype
        });

        const savedMedia = await newMedia.save();

        // Return the URL that points to our GET route
        const fileUrl = `${req.protocol}://${req.get('host')}/api/upload/${savedMedia._id}`;
        res.json({ url: fileUrl });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Failed to save image to database' });
    }
});

module.exports = router;
