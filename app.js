const express = require('express');
const { getCategories } = require('./controllers/categories.js');
const { handle404Errors, handle500Errors } = require('./controllers/controllers.errors.js');
const app = express();
app.use(express.json());

app.get('/api/categories', getCategories);

app.all("*", handle404Errors);
app.use(handle500Errors);

module.exports = app;