function handle404NonExistentPaths(request, response, next) {
    response.status(404).send( { "msg": "This path does not exist!" } );
}

function handleCustomErrors(error, request, response, next) {
    if (error.status && error.msg) {
        response.status(error.status).send( { "msg": error.msg } )
    }
    else {
        next(error);
    }
}

function handleValidButNonExistentReviewIdsOrUsernames(error, request, response, next) {
    if (error.code === "23503") {
        response.status(404).send( { "msg": "The review ID or username does not exist." } );
    }
    else {
        next(error);
    }
}

function handleInvalidReviewAndCommentIds(error, request, response, next) {
    if (error.code === '22P02') {
        response.status(400).send( { "msg": "The review or comment ID is invalid." } );
    }
    else {
        next(error);
    }
}

function handle500InternalServerErrors(error, request, response, next) {
    console.log(error);
    response.status(500).send( { "msg": "Internal server error!" } );
}

module.exports = {
    handle404NonExistentPaths,
    handleCustomErrors,
    handleValidButNonExistentReviewIdsOrUsernames,
    handleInvalidReviewAndCommentIds,
    handle500InternalServerErrors
};
