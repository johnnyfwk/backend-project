const { selectReviews, selectComments } = require('../models/reviews.js');

function getReviews(req, res, next) {
    selectReviews()
        .then((reviews) => {
            res.status(200).send( { reviews } );
        })
        .catch((err) => {
            next(err);
        })
}

function getCommentsByReviewId(req, res, next) {
    const reviewId = req.params.review_id;
    selectComments(reviewId)
        .then((comments) => {
            res.status(200).send( { "commentsById": comments } );
        })
        .catch((err) => {
            next(err);
        })
}

module.exports = { getReviews, getCommentsByReviewId };