const db = require('../db/connection.js');

function removeCommentByCommentId(commentId) {
    const queryString = `
        DELETE FROM comments
        WHERE comment_id = $1
        RETURNING *;
    `
    const queryValues = [commentId];

    return db
        .query(queryString, queryValues)
        .then((result) => {
            if (result.rowCount === 0) {
                return Promise.reject( { "status": 404, "msg": "The comment ID does not exist." } );
            }
            return result.rows[0];
        })
}

module.exports = {
    removeCommentByCommentId
};