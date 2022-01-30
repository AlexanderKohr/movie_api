// Imports the express module and the Morgan module
const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');


let users = [
    {
        id: 1,
        name: "Kim",
        favoriteMovies: []
    },
    {
        id: 2,
        name: "Joe",
        favoriteMovies: ["The Matrix"]
    }
];

let movies = [
    {
        "Title": "The Matrix",
        "Genre": {
            "Name": "Sci-Fi"
        },
        "Director": {
            "Name": "Lana Wachowski"
        }
    },
    {
        "Title": "Pi",
        "Genre": {
            "Name": "Drama"
        },
        "Director": {
            "Name": "Darren Aronofsky"
        }
    },
    {
        "Title": "American Beauty",
        "Genre": {
            "Name": "Drama"
        },
        "Director": {
            "Name": "Sam Mendes"
        } 
    },
    {
        "Title": "Eternal Sunshine of the Spotless Mind",
        "Genre": {
            "Name": "Drama"
        },
        "Director": {
            "Name": "Michel Gondry"
        } 
    },
    {
        "Title": "Shutter Island",
        "Genre": {
            "Name": "Thriller"
        },
        "Director": {
            "Name": "Martin Scorsese"
        } 
    },
    {
        "Title": "Fight Club",
        "Genre": {
            "Name": "Drama"
        },
        "Director": {
            "Name": "David Fincher"
        } 
    }
]

// after importing express it needs to be added to the app in order to start using it
const app = express();

// reads the data out of the request body 
app.use(bodyParser.json());

// Morgan middleware library in use to log all requests to the terminal
app.use(morgan('common'));

// CREATE
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send('users need names');
    }
})


// UPDATE
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find( user => user.id == id);

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('no such user');
    }
})


// CREATE
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to ${id}'s array`);
    } else {
        res.status(400).send('no such user');
    }
})


// DELETE
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter( litle => litle !== movieTitle);
        res.status(200).send( `${movieTitle} has been removed from ${id}'s array`);
    } else {
        res.status(400).send('no such user');
    }
})


// DELETE
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;

    let user = users.find( user => user.id == id);

    if (user) {
        users = users.filter( user => user.id != id);
        res.status(200).send( `user ${id} has been deleted`);
    } else {
        res.status(400).send('no such user');
    }
})


// READ route located at endpoint '/movies', returning .json object
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

// READ 
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find ( movie => movie.Title === title );

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('no such movie');
    }
})


// READ 
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find ( movie => movie.Genre.Name === genreName ).Genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('no such genre');
    }
})


// READ 
app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find ( movie => movie.Director.Name === directorName ).Director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('no such director');
    }
})

// Function to serve all static files inside one folder
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