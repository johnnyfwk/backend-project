const { selectReviews, selectReviewById } = require('../models/reviews.js');

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

module.exports = { getReviews, getReviewById };