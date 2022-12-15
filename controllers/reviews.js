const {
    selectReviews,
    selectReviewById,
    selectComments,
    addCommentByReviewId,
    updateReviewVotesByReviewId
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
        .then((comment) => {
            res.status(201).send( { comment } );
        })
        .catch((err) => {
            next(err);
        })
}

function patchReviewVotesByReviewId(req, res, next) {
    const reviewId = req.params.review_id;
    const newVotes = req.body.inc_votes;
    updateReviewVotesByReviewId(reviewId, newVotes)
        .then((review) => {
            console.log("Review: ", review);
            res.status(200).send( { review } );
        })
        .catch((err) => {
            next(err);
        })
}

module.exports = {
    getReviews,
    getReviewById,
    getCommentsByReviewId,
    postCommentByReviewId,
    patchReviewVotesByReviewId
};
