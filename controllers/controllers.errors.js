function handle404Errors(req, res, next) {
    res.status(404).send( { "msg": "Path does not exist!!!!!" } );
}

function handle500Errors(err, req, res, next) {
    console.log(err);
    res.status(500).send( { "msg": "Server error!!!!! "} );
}

module.exports = { handle404Errors, handle500Errors };