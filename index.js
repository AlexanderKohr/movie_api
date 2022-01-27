// Imports the express module and the Morgan module
const express = require('express'),
    morgan = require('morgan');


// after importing express it needs to be added to the app in order to start using it
const app = express();

// Morgan middleware library in use to log all requests to the terminal
app.use(morgan('common'));

// GET route located at endpoint '/', returning default textual response
app.get('/', (req, res) => {
    res.send('Welcome to my app!');
});

// GET route located at endpoint '/movies', returning .json object
app.get('/movies', (req, res) => {
    res.json('My top 10 movies.');
});

// Function to serve all static files inside on folder
app.use(express.static('public'));


// Error-handling middleware function that will log all application-level errors to the terminal
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Server listens to Port 8080. For HTTP Port 80 is the default Port
app.listen(8080, () => {
    console.log('Your app is listening to Port 8080.');
});