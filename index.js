const http = require('http');
const express = require('express');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const cors = require('cors');
const { getMovies } = require('./db');
const app = express();


app.use(cors({
    origin: 'http://localhost:5173', // Replace with your React app's URL
    methods: ['GET', 'POST'], // Specify allowed methods
    allowedHeaders: ['Content-Type'], // Specify allowed headers
}));    

const MongoClient = require('mongodb').MongoClient

const url = "mongodb+srv://ouateedemloic:wXWbcesw7Fpp9mEL@olympicapi.ibg9v.mongodb.net/?retryWrites=true&w=majority&appName=OlympicApi"
MongoClient.connect(url, (err, client) => {
    if (err) throw err

    const db = client.db('sample_mflix')

    db.collection('movies').find().toArray((err, result) => {
        if (err) throw err

        console.log(result)
    })
})

app.use(express.json())


const secretKey = 'ouatedem237'; // To be stored securely in an env file

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("server running on port 3000...")
})

app.get('/', (req, res) => {
    res.send("Hello world!!!")
})

const data = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
];

app.get('/items', (req, res) => {
    res.status(200).json(data)
})

app.get('/api/movies', async (req, res) => {
    try {
        // Get the limit from the query parameters, or default to 10 if not provided
        const limit = parseInt(req.query.limit) || 10;

        // Fetch the movies with the specified limit
        const movies = await getMovies(limit);

        // Send the movies as a JSON response
        res.status(200).json(movies);
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// GET method
app.get('/items/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const items = data.find(items => items.id === id)

    if (!items) {
        res.status(401).json({ error: "Item not found!" })
    } else {
        res.status(200).json({ "This is your item": items })
    }
})

// POST method
app.post('/items', (req, res) => {
    const newItem = req.body;
    const id = data.length + 1
    data.push({ "id": id, "name": newItem.name });
    res.status(201).json(data);
});
// Body eg: { "name" : "Ouatedem" }

// PUT method
app.put('/items/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const updatedItem = req.body;
    const index = data.findIndex((items) => items.id === id)
    if (index === -1) {
        res.status(401).json({ error: "Item not found" })
    } else {
        data[index] = { ...data[index], ...updatedItem }
        res.json(data)
    }
})
// Body eg: { "name" : "Ouatedem" }

// DELETE method
app.delete('/items/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const index = data.findIndex((items) => items.id === id)
    if (index === -1) {
        res.status(404).json({ error: "Item not found" })
    } else {
        const deletedItem = data.splice(index, 1)
        res.status(200).json(data)
    }
})


// Sample user data (replace with a real database)
const users = [
    { id: 1, username: 'user1', password: '$2b$10$KIBUMT/2twyCojommYKrUOyQZFJm3AZ/julkfXEeaU1Bw1bZG582a' }, // Hashed password: "password1"
    { id: 2, username: 'user2', password: '$2b$10$tswos8gALXE/n02SqhkW4.LR37YxG5pPxCMlqRzuvecqgFCFhSpbi' }, // Hashed password: "password2"
];

// Function to verify user credentials
function authenticateUser(username, password) {
    const user = users.find((user) => user.username === username);
    if (!user) {
        return null; // User not found
    }
    if (bcrypt.compareSync(password, user.password)) {
        return user; // Password is correct
    }
    return null; // Password is incorrect
}

// Login
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = authenticateUser(username, password);

    if (!user) {
        return res.status(401).json({ error: 'Authentication failed' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, secretKey, {
        expiresIn: '1h', // Token expiration time
    });

    res.json({ token });
});

function authenticateToken(req, res, next) {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication token missing' });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token is invalid' });
        }
        req.user = user;
        next(); // Continue to the protected route
    });
}

// Example usage:
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
}); 
