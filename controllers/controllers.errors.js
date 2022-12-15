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

function queryOrColumnDoesNotExist(err, req, res, next) {
    if (err.code === "42703" || err.code === "22P02") {
        res.status(400).send( { "msg": "Query or column does not exist!!!!!" } );
    }
    else {
        next(err);
    }
}

function handle500Errors(err, req, res, next) {
    console.log(err);
    res.status(500).send( { "msg": "Server error!!!!!"} );
}

module.exports = { handle404Errors, handleCustomErrors, queryOrColumnDoesNotExist, handle500Errors };

