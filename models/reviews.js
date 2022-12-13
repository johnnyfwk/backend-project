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

function selectComments() {
    const queryString = `
        SELECT * FROM reviews;
    `

    return db
        .query(queryString)
        .then((result) => {
            console.log(result);
        })
}

module.exports = { selectReviews, selectComments };