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


function selectComments(reviewId) {
    const queryString = `
        SELECT * FROM reviews
        WHERE review_id = $1;
    `

    return db
        .query(queryString, [reviewId])
        .then((result) => {            
            if (result.rowCount === 0) {
                return Promise.reject( { "status": 404, "msg": "ID is valid but does not exist!!!!!" } );
            }
            
            const queryStringForCurrentIds = `
                SELECT * FROM comments
                WHERE review_id = $1
                ORDER BY created_at DESC;
            `
            
            return db
                .query(queryStringForCurrentIds, [reviewId]);
        })
        .then((result) => {
            return result.rows;
        })
}


function addCommentByReviewId(reviewId, commentToAdd) {
    const queryString = `
        SELECT * FROM reviews
        WHERE review_id = $1;
    `
    const queryValues = [reviewId];

    return db
        .query(queryString, queryValues)
        .then((result) => {
            if (result.rowCount === 0) {
                return Promise.reject( { "status": 404, "msg": "ID is valid but does not exist!!!!!" } );
            }

            const queryString = `
                SELECT * FROM users
                WHERE username = $1;
            `

            const queryValues = [commentToAdd.username];

            return db.query(queryString, queryValues)              
        })
        .then((result) => {
            if (result.rowCount === 0) {
                return Promise.reject( { "status": 400, "msg": "Username does not exist in the database!!!!!" } );
            }

            const queryString = `
                INSERT INTO comments
                    (body, author, review_id, votes, created_at)
                VALUES
                    ($1, $2, $3, $4, $5)
                RETURNING *;
            `

            const queryValues = [
                commentToAdd.body,
                commentToAdd.username,
                reviewId,
                0,
                new Date(1651942274566)
            ];

            return db.query(queryString, queryValues)
        })
        .then((result) => {
            return result.rows[0];
        })
}

module.exports = {
    selectReviews,
    selectReviewById,
    selectComments,
    addCommentByReviewId
};

