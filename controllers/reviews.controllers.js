const {
    selectReviews,
    selectReviewById,
    selectCommentsByReviewId,
    addCommentByReviewId,
    updateReviewVotesByReviewId
} = require('../models/reviews.models.js');

function getReviews(request, response, next) {
    const queries = request.query;
    selectReviews(queries)
        .then((reviews) => {
            response.status(200).send( { reviews } );
        })
        .catch((error) => {
            next(error);
        })
}

function getReviewById(request, response, next) {
    const reviewId = request.params.review_id;
    selectReviewById(reviewId)
        .then((review) => {
            response.status(200).send( { review } );
        })
        .catch((error) => {
            next(error);
        })
}

function getCommentsByReviewId(request, response, next) {
    const reviewId = request.params.review_id;
    selectCommentsByReviewId(reviewId)
        .then((comments) => {
            response.status(200).send( { comments } );
        })
        .catch((error) => {
            next(error);
        })
}

function postCommentByReviewId(request, response, next) {
    const reviewId = request.params.review_id;
    const commentToPost = request.body;
    addCommentByReviewId(reviewId, commentToPost)
        .then((comment) => {
            response.status(201).send( { comment } );
        })
        .catch((error) => {
            next(error);
        })
}

function patchReviewVotesByReviewId(request, response, next) {
    const reviewId = request.params.review_id;
    const newVotes = request.body
    updateReviewVotesByReviewId(reviewId, newVotes)
        .then((review) => {
            response.status(200).send( { review } );
        })
        .catch((error) => {
            next(error);
        })
}

module.exports = {
    getReviews,
    getReviewById,
    getCommentsByReviewId,
    postCommentByReviewId,
    patchReviewVotesByReviewId
};
