
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');


const app = express();
const port = process.env.PORT || 3000;


app.use(bodyParser.json()); 


const dbURI = 'mongodb+srv://<username>:<password>@cluster.mongodb.net/myDatabase?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));


const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }
});
const Customer = mongoose.model('Customer', customerSchema);


app.post('/customer', async (req, res) => {
    try {
        if (!req.body.name || !req.body.email) {
            return res.status(400).send('Name and Email are required');
        }
        const customer = new Customer(req.body);
        await customer.save();
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/customer', async (req, res) => {
    try {
        if (!req.query.email) {
            return res.status(400).send('Email parameter is required');
        }
        const customer = await Customer.findOne({ email: req.query.email });
        if (!customer) {
            return res.status(404).send('Customer not found');
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/customer', async (req, res) => {
    try {
        if (!req.query.email) {
            return res.status(400).send('Email parameter is required');
        }
        const customer = await Customer.findOneAndUpdate(
            { email: req.query.email },
            req.body,
            { new: true, runValidators: true }
        );
        if (!customer) {
            return res.status(404).send('Customer not found');
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/customer', async (req, res) => {
    try {
        if (!req.query.email) {
            return res.status(400).send('Email parameter is required');
        }
        const customer = await Customer.findOneAndDelete({ email: req.query.email });
        if (!customer) {
            return res.status(404).send('Customer not found');
        }
        res.json({ message: 'Customer deleted', customer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.use((req, res) => {
    res.status(404).send('We think you are lost!');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).sendFile(path.join(__dirname, 'public', '500.html'));
});


app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
