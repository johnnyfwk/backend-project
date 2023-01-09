const express = require('express');
const app = express();
app.use(express.json());
const cors = require('cors');

const {
    getCategories
} = require('./controllers/categories.controllers.js');

const {
    getReviews,
    getReviewById,
    getCommentsByReviewId,
    postCommentByReviewId,
    patchReviewVotesByReviewId
} = require('./controllers/reviews.controllers.js');

const {
    getUsers
} = require('./controllers/users.controllers.js');

const {
    handle404NonExistentPaths,
    handleCustomErrors,
    handleValidButNonExistentReviewIdsOrUsernames,
    handleInvalidReviewAndCommentIds,
    handle500InternalServerErrors
} = require('./controllers/errors.controllers.js');

const {
    deleteCommentByCommentId
} = require('./controllers/comments.controllers.js');

app.use(cors());

app.get('/api/categories', getCategories);
app.get('/api/reviews', getReviews);
app.get('/api/reviews/:review_id', getReviewById);
app.get('/api/reviews/:review_id/comments', getCommentsByReviewId);
app.post('/api/reviews/:review_id/comments', postCommentByReviewId);
app.patch('/api/reviews/:review_id', patchReviewVotesByReviewId);
app.get('/api/users', getUsers);
app.delete('/api/comments/:comment_id', deleteCommentByCommentId);

app.all('*', handle404NonExistentPaths);

app.use(handleCustomErrors);
app.use(handleValidButNonExistentReviewIdsOrUsernames);
app.use(handleInvalidReviewAndCommentIds);
app.use(handle500InternalServerErrors);

module.exports = app;
