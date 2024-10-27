const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const firebaseAdmin = require('firebase-admin');
const path = require('path');

const serviceAccount = require('./firebase-key.json');
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount)
});
const db = firebaseAdmin.firestore();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
});

// Route to save SOS reports
app.post('/saveSOS', async (req, res) => {
    const { message, latitude, longitude } = req.body;

    // Enhanced validation logic
    if (!message || typeof message !== 'string' || typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).send("Message, latitude, and longitude are required and must be valid.");
    }

    try {
        // Save to Firebase
        const docRef = await db.collection('sosReports').add({
            message: message,
            location: new firebaseAdmin.firestore.GeoPoint(latitude, longitude),
            timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(200).send(`SOS report saved with ID: ${docRef.id}`);
    } catch (error) {
        console.error("Error saving SOS report:", error);
        res.status(500).send("Error saving SOS report");
    }
});

// Route to save comments
app.post('/saveComment', async (req, res) => {
    const { comment } = req.body;

    // Basic validation
    if (!comment || typeof comment !== 'string') {
        return res.status(400).send("Comment must be a valid string.");
    }

    try {
        // Save to Firebase or your preferred database
        await db.collection('comments').add({
            comment: comment,
            timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(200).send("Comment submitted successfully.");
    } catch (error) {
        console.error("Error saving comment:", error);
        res.status(500).send("Error saving comment.");
    }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
