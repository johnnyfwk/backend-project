const {
    selectUsers
} = require('../models/users.models.js');

function getUsers(request, response, next) {
    selectUsers()
        .then((users) => {
            response.status(200).send( { users } );
        })
        .catch((error) => {
            next(error);
        })
}

module.exports = {
    getUsers
};
