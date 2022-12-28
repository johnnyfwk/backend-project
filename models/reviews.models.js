const e = require('express');
const db = require('../db/connection.js');

function selectReviews(queries) {
    if (queries.category === "") {
        return Promise.reject( { "status": 400, "msg": "You entered a category with no value. Please enter a valid category." } );
    }
    if (queries.sort_by === "") {
        return Promise.reject( { "status": 400, "msg": "You entered a sort_by with no value. Please enter a valid sort_by." } );
    }
    if (queries.order === "") {
        return Promise.reject( { "status": 400, "msg": "You entered an order with no value. Please enter a valid order value." } );
    }

    if (!isNaN(queries.category)) {
        return Promise.reject( { "status": 400, "msg": "The category is invalid. Please enter a valid category name." } )
    }
    if (!isNaN(queries.sort_by)) {
        return Promise.reject( { "status": 400, "msg": "The sort_by is invalid. Please enter a valid sort_by name." } )
    }
    if (!isNaN(queries.order)) {
        return Promise.reject( { "status": 400, "msg": "The order is invalid. Please enter a valid order value." } )
    }
    
    const validCategories = [
        "euro game",
        "social deduction",
        "dexterity",
        "children's games"
    ];

    const validSortBys = [
        "review_id",
        "title",
        "designer",
        "owner",
        "review_img_url",
        "review_body",
        "category",
        "created_at",
        "votes",
    ];

    const validOrders = [
        "asc",
        "desc"
    ];

    let queryStringReviews = `
        SELECT *
        FROM reviews
    `
    const queryValuesReviews = [];

    let categoryMinusHyphens;
    if (queries.category) {
        categoryMinusHyphens = queries.category.replaceAll("-", " ");
        if (validCategories.includes(categoryMinusHyphens)) {
            queryStringReviews += ` WHERE category = $1`;
            queryValuesReviews.push(categoryMinusHyphens);
        }
        else {
            return Promise.reject( { "status": 404, "msg": "The category does not exist." } );
        }
    }
    
    let sortBy = "created_at";
    if (queries.sort_by !== undefined) {
        if (validSortBys.includes(queries.sort_by)) {
            sortBy = queries.sort_by;
        }
        else {
            return Promise.reject( { "status": 404, "msg": "The sort_by does not exist." } );
        }
    }

    let order = "desc";
    if (queries.order !== undefined) {
        if (validOrders.includes(queries.order)) {
            order = queries.order;
        }
        else {
            return Promise.reject( { "status": 404, "msg": "The order does not exist. Please enter a valid order value." } );
        }
    }

    queryStringReviews += ` ORDER BY ${sortBy} ${order};`;

    return db
        .query(queryStringReviews, queryValuesReviews)
        .then((result) => {
            const queryStringComments = `
                SELECT *
                FROM comments;
            `
            const reviews = result.rows;
            const comments = db.query(queryStringComments);
            const promises = Promise.all([reviews, comments]);
            return promises;
        })
        .then((reviewsAndComments) => {
            const reviews = reviewsAndComments[0];
            const comments = reviewsAndComments[1].rows;

            const reviewsWithCommentCounts = reviews.map((review) => {
                let totalCommentsForEachReviewId = 0;
                comments.forEach((comment) => {
                    if (review.review_id === comment.review_id) {
                        totalCommentsForEachReviewId++;
                    }
                })
                const reviewCopy = { ...review };
                reviewCopy.comment_count = totalCommentsForEachReviewId;
                return reviewCopy;
            })

            return reviewsWithCommentCounts;
        })
}

function selectReviewById(reviewId) {
    const reviewsQueryString = `
        SELECT *
        FROM reviews
        WHERE review_id = $1;
    `
    const reviewsQueryValues = [reviewId];

    return db
        .query(reviewsQueryString, reviewsQueryValues)
        .then((result) => {
            if (result.rowCount === 0) {
                return Promise.reject( { "status": 404, "msg": "The review ID in the path is valid but does not exist." } );
            }

            const review = result.rows[0];

            const commentsQueryString = `
            SELECT *
            FROM comments
            WHERE review_id = $1
            `
            const commentsQueryValues = [reviewId];

            const commentsDbRequest = db.query(commentsQueryString, commentsQueryValues);

            const promises = Promise.all( [ commentsDbRequest, review ] );
            return promises;
        })
        .then((result) => {
            const comments = result[0].rows;
            const review = result[1];
            const reviewCopy = { ...review };
            reviewCopy.comment_count = comments.length;
            return reviewCopy;
        })
}

function selectCommentsByReviewId(reviewId) {
    const queryStringReviews = `
        SELECT *
        FROM reviews
        WHERE review_id = $1;
    `
    const queryValues = [reviewId];

    return db
        .query(queryStringReviews, queryValues)
        .then((result) => {
            if (result.rowCount === 0) {
                return Promise.reject( { "status": 404, "msg": "That review ID does not exist." } )
            }
            const queryStringComments = `
                SELECT * FROM comments
                WHERE review_id = $1
                ORDER BY created_at DESC;
            `

            return db.query(queryStringComments, queryValues)
        })
        .then((result) => {
            if (result.rowCount === 0) {
                return Promise.reject( { "status": 200, "msg": "There are no comments associated with that review ID." } );
            }
            return result.rows;
        })
}

function addCommentByReviewId(reviewId, commentToPost) {
    if (Object.keys(commentToPost).length === 0) {
        return Promise.reject( { "status": 400, "msg": "You did not enter your username or comment. Please enter both your username and comment." } );
    }
    if (commentToPost.body === undefined) {
        return Promise.reject( { "status": 400, "msg": "You did not enter your comment. Please enter a comment." } );
    }
    if (commentToPost.username === undefined) {
        return Promise.reject( { "status": 400, "msg": "You did not enter your username. Please enter your username." } );
    }

    const queryString = `
        INSERT INTO comments
            (body, author, review_id, votes, created_at)
        VALUES
            ($1, $2, $3, $4, $5)
        RETURNING *;
    `

    const queryValues = [
        commentToPost.body,
        commentToPost.username,
        reviewId,
        0,
        new Date(1651942274566)
    ];

    return db
        .query(queryString, queryValues)
        .then((result) => {
            return result.rows[0];
        })
}

function updateReviewVotesByReviewId(reviewId, newVotes) {
    if (!newVotes.hasOwnProperty("inc_votes")) {
        return Promise.reject( { "status": 400, "msg": "The votes object does not include the 'inc_votes' property. Please include the 'inc_votes' property and the number of votes to add." } );
    }
    if (typeof newVotes.inc_votes !== "number") {
        return Promise.reject( { "status": 400, "msg": "The 'inc_votes' value is invalid. Please enter a number for the 'inc_votes' property." } );
    }

    const queryString = `
        UPDATE reviews
        SET votes = votes + $1
        WHERE review_id = $2
        RETURNING *;
    `
    const queryValues = [newVotes.inc_votes, reviewId];

    return db
        .query(queryString, queryValues)
        .then((result) => {
            if (result.rowCount === 0) {
                return Promise.reject( { "status": 404, "msg": "The review ID does not exist." } );
            }
            if (result.rows[0].votes < 0) {
                return Promise.reject( { "status": 400, "msg": "The 'inc_votes' value you entered is greater than the number of votes. Please enter a valid number." } );
            }
            return result.rows[0];
        })
}

module.exports = {
    selectReviews,
    selectReviewById,
    selectCommentsByReviewId,
    addCommentByReviewId,
    updateReviewVotesByReviewId
}
