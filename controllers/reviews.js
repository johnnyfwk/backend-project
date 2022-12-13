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

function getCommentsForReviewId(req, res, next) {
    selectComments()
        .then((comments) => {
            console.log("Comments: ", comments);
            res.status(200).send( { comments } );
        })
}

module.exports = { getReviews, getCommentsForReviewId };