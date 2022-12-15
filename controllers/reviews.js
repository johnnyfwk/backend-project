const {
    selectReviews,
    selectReviewById,
    selectComments,
    addCommentByReviewId
} = require('../models/reviews.js');

function getReviews(req, res, next) {
    selectReviews()
        .then((reviews) => {
            res.status(200).send( { reviews } );
        })
        .catch((err) => {
            next(err);
        })
}

function getReviewById(req, res, next) {
    const reviewId = req.params.review_id;
    selectReviewById(reviewId)
        .then((review) => {
            res.status(200).send( { review } );
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

function postCommentByReviewId(req, res, next) {    
    const reviewId = req.params.review_id;
    const commentToAdd = req.body;
    addCommentByReviewId(reviewId, commentToAdd)
        .then((postedComment) => {
            res.status(201).send( { postedComment } );
        })
        .catch((err) => {
            next(err);
        })
}

module.exports = {
    getReviews,
    getReviewById,
    getCommentsByReviewId,
    postCommentByReviewId
};
