const express = require('express');

const { getCategories } = require('./controllers/categories.js');
const { getReviews, getCommentsByReviewId } = require('./controllers/reviews.js');
const {
    handle404Errors,
    handleCustomErrors,
    queryOrColumnDoesNotExist,
    handle500Errors
} = require('./controllers/controllers.errors.js');

const app = express();

app.get('/api/categories', getCategories);
app.get('/api/reviews', getReviews);
app.get('/api/reviews/:review_id/comments', getCommentsByReviewId)

app.all("*", handle404Errors);

app.use(handleCustomErrors);
app.use(queryOrColumnDoesNotExist);
app.use(handle500Errors);

module.exports = app;