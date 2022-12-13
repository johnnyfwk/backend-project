const { selectReviews } = require('../models/reviews.js');

function getReviews(req, res, next) {
    selectReviews()
        .then((reviews) => {
            res.status(200).send( { reviews } );
        })
        .catch((err) => {
            next(err);
        })
}

module.exports = { getReviews };