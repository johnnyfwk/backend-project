const express = require('express');

const { getCategories } = require('./controllers/categories.js');
const { getReviews, getCommentsForReviewId } = require('./controllers/reviews.js');
const { handle404Errors, handle500Errors } = require('./controllers/controllers.errors.js');

const app = express();

app.get('/api/categories', getCategories);
app.get('/api/reviews', getReviews);
app.get('/api/reviews/:review_id/comments, getCommentsForReviewId')

app.all("*", handle404Errors);
app.use(handle500Errors);

module.exports = app;