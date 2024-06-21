const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000; // Use port from environment variable or default to 3000

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/budgetApproval', {
    useNewUrlParser: true,
    useUnifiedTopology: true, // Use new server discovery and monitoring engine
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
    console.log('Connected to MongoDB');
});

// Define Schema and Model for Requests
const requestSchema = new mongoose.Schema({
    title: String,
    description: String,
    amount: Number,
    status: String // 'pending' or 'proceeded'
});

const Request = mongoose.model('Request', requestSchema);

// Routes
app.post('/api/requests', async (req, res) => {
    try {
        const newRequest = new Request(req.body);
        await newRequest.save();
        res.status(201).send(newRequest);
    } catch (err) {
        res.status(400).send(err);
    }
});

app.get('/api/requests', async (req, res) => {
    try {
        const requests = await Request.find();
        res.send(requests);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.put('/api/requests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedRequest = await Request.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedRequest) {
            return res.status(404).send({ message: 'Request not found' });
        }
        res.send(updatedRequest);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.delete('/api/requests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRequest = await Request.findByIdAndDelete(id);
        if (!deletedRequest) {
            return res.status(404).send({ message: 'Request not found' });
        }
        res.send({ message: 'Request deleted successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
