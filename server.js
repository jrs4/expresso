const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const morgan = require('morgan');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

module.exports = app;

const PORT = process.env.PORT || 4000;

// Middware for parsing request bodies
app.use(bodyParser.json());

// Middleware for handling CORS requests from index.html
app.use(cors());

//Middleware for logging
app.use(morgan('tiny'));

/*****************Routes*********************/
const employeesRouter = require('./server/employees.js');
app.use('/api/employees', employeesRouter);

const menusRouter = require('./server/menus.js');
app.use('/api/menus', menusRouter);

// This conditional is here for testing purposes:
if (!module.parent) { 
  // Add your code to start the server listening at PORT below:
  app.listen(PORT, () => console.log('I am listening!'));
}