// requires cors to controll domains that are allowed to use the API
const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];
app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            let message = 'The CORS policy for this application does not allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));

// requires express validator to validate user input on the server side
const { check, validationResult } = require('express-validator');



// requires the Mongoose package and the Mongoose Models created in models.js
const mongoose = require('mongoose');
const Models = require('./models.js');

// refereing to the model names defined in models.js
const Movies = Models.Movie;
const Users= Models.User;


// allows Mongoose to connect to database myFlixDB
// so it can perform CRUD operations on the documents it contains from within the REST API.
/*mongoose.connect('mongodb://localhost:27017/myFlixDB', 
    { useNewUrlParser: true, useUnifiedTopology: true});*/

mongoose.connect('process.env.CONNECTION_URI', 
    { useNewUrlParser: true, useUnifiedTopology: true});


// Imports the express module and the Morgan module
const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');
const req = require('express/lib/request');
const res = require('express/lib/response');

/*
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
*/


// after importing express it needs to be added to the app in order to start using it
const app = express();

// reads the data out of the request body 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// imports the auth.js file into the project
// the (app) argument ensures that Express is availible in auth.js file as well
let auth = require('./auth')(app);

// requires the Passport module and imports passport.js
const passport = require('passport');
require('./passport');

// Morgan middleware library in use to log all requests to the terminal
app.use(morgan('common'));

app.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.send('Welcome to myFlix!');
});

//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users', [

    // checks that the fields contain something, then checks that the data follows the correct format
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric character - not allowed').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()

], (req, res) => {

    // checks the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    // hashes any password enteres by the iser when registering before storing it in the MongoDB database
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
    .then((user) => {
        // if user already exists, this message will be returned
        if (user) {
            return res.status(400).send(rep.body.Username + 'already exists');
        } else {
            // if user does not exist, it will create a new user document in Users collection
            Users
                .create({
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                })
                // this callback takes the created document as a parameter, in this case named user.
                // it will give the client feddback on the transaction, letting them know that it's been completed
                .then((user) => {
                    res.status(201).json(user)
                })
                // catch() function that will catch any problems that 
                //Mongoose encounters while running the create commmand
                .catch((error) => {
                    console.error(error);
                    res.status(500).send('Error: ' + error);
                })
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});

// DELETES a user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found.');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// gets all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error:' + err);
        });
});


// gets a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((users) => {
            res.json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// updates the data of a specific user
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),[

        // checks that the fields contain something, then checks that the data follows the correct format
        check('Username', 'Username is required').isLength({min: 5}),
        check('Username', 'Username contains non alphanumeric character - not allowed').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()

    ], (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username },
        { $set: {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
    { new: true }, // this makes sure that the updated document is returned
    (err, updatedUser) => {
        if(err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

// adds a movie to a users list of favorite movies
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, 
        { $push: { FavoriteMovies: req.params.MovieID }
    },
    { new: true }, // this line makes sure that the updated document is returned
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});


// deletes a movie from a users list of favorite movies
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, 
        { $pull: { FavoriteMovies: req.params.MovieID }
    },
    { new: true }, // this line makes sure that the updated document is returned
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});


// READ route located at endpoint '/movies', returning .json object with all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// finds a movie by its title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            res.status(500).send('Error: ' + err);
        });
});


// gets description of a genre
app.get('/genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.Name })
        .then((movie) => {
            res.json(movie.Genre.Description);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
})


// gets information about a director
app.get('/director/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.Name })
        .then((movie) => {
            res.json(movie.Director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Function to serve all static files inside one folder
app.use(express.static('public'));


// Error-handling middleware function that will log all application-level errors to the terminal
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Server listens to Port 8080. For HTTP Port 80 is the default Port
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});