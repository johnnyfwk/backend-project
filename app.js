const express = require('express');

const { getCategories } = require('./controllers/categories.js');
const { getReviews, getReviewById } = require('./controllers/reviews.js');
const {
    handle404Errors,
    handleCustomErrors,
    handle500Errors,
    queryOrColumnDoesNotExist
} = require('./controllers/controllers.errors.js');

const app = express();

app.get('/api/categories', getCategories);
app.get('/api/reviews/', getReviews);
app.get('/api/reviews/:review_id', getReviewById)

app.all("*", handle404Errors);
app.use(queryOrColumnDoesNotExist);
app.use(handleCustomErrors);
app.use(handle500Errors);

module.exports = app;