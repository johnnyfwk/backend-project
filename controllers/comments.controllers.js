const {
    removeCommentByCommentId
} = require('../models/comments.models.js');

function deleteCommentByCommentId(request, response, next) {
    const commentId = request.params.comment_id;
    removeCommentByCommentId(commentId)
        .then((deletedComment) => {
            response.status(204).send( { deletedComment } );
        })
        .catch((error) => {
            next(error);
        })
}

module.exports = {
    deleteCommentByCommentId
};