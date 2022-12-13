const db = require('../db/connection.js');

function selectReviews() {    
    const queryString = `
        SELECT
            reviews.owner,
            reviews.title,
            reviews.review_id,
            reviews.category,
            reviews.review_img_url,
            reviews.created_at,
            reviews.votes,
            reviews.designer,
            COUNT(comment_id) AS comment_count
        FROM reviews
        LEFT JOIN comments
        ON reviews.review_id = comments.review_id
        GROUP BY reviews.review_id
        ORDER BY reviews.created_at DESC;
    `
    return db
        .query(queryString)
        .then((result) => {
            return result.rows;
        })
}

function selectReviewById(reviewId) {
    const stringQuery = `
        SELECT *
        FROM reviews
        WHERE review_id = ${reviewId};
    `

    return db
        .query(stringQuery)
        .then((result) => {
            if (result.rowCount === 0) {
                return Promise.reject( { "status": 404, "msg": "ID is valid but does not exist!!!!!" } );
            }
            return result.rows[0];
        })
}

module.exports = { selectReviews, selectReviewById };