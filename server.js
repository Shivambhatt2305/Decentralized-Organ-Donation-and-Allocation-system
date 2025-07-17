const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const Routes = require('./routes/routing');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '/public')));
app.set('view engine', 'ejs');

app.use(session({
    secret: '$23456Hi!',  // Use a strong secret for production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }   // Use 'true' for HTTPS
}));




// Render the Login Form
app.use('/', Routes.routes);


// Start the Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
