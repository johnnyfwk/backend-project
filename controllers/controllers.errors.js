function handle404Errors(req, res, next) {
    res.status(404).send( { "msg": "Path does not exist!!!!!" } );
}

function handleCustomErrors(err, req, res, next) {
    if (err.status && err.msg) {
        res.status(err.status).send( { "msg": err.msg } );
    }
    else {
        next(err);
    }
}

function handleNonExistentReviewIdsOrUsernames(err, req, res, next) {
    if (err.code === "23503") {
        res.status(404).send( { "msg": "The review ID or username you entered does not exist." } );
    }
    else {
        next(err);
    }
}

function handleInvalidReviewIds(err, req, res, next) {
    if (err.code === "42703" || err.code === "22P02") {
        res.status(400).send( { "msg": "The review ID you entered is not valid." } )
    }
    else {
        next(err);
    }
}

function handle500Errors(err, req, res, next) {
    console.log(err);
    res.status(500).send( { "msg": "Server error!!!!!"} );
}

module.exports = { handle404Errors, handleCustomErrors, handleNonExistentReviewIdsOrUsernames, handleInvalidReviewIds, handle500Errors };

