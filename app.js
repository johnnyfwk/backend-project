const express = require('express');

const { getCategories } = require('./controllers/categories.js');
const {
    getReviews,
    getReviewById,
    getCommentsByReviewId,
    postCommentByReviewId
} = require('./controllers/reviews.js');
const {
    handle404Errors,
    handleCustomErrors,
    queryOrColumnDoesNotExist,
    handle500Errors
} = require('./controllers/controllers.errors.js');

const app = express();
app.use(express.json());

app.get('/api/categories', getCategories);

app.get('/api/reviews/', getReviews);
app.get('/api/reviews/:review_id', getReviewById);
app.get('/api/reviews/:review_id/comments', getCommentsByReviewId);
app.post('/api/reviews/:review_id/comments', postCommentByReviewId);

app.all("*", handle404Errors);

app.use(handleCustomErrors);
app.use(queryOrColumnDoesNotExist);
app.use(handle500Errors);

module.exports = app;