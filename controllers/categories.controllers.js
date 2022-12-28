const {
    selectCategories
} = require('../models/categories.models.js');

function getCategories(request, response, next) {
    selectCategories()
        .then((categories) => {
            response.status(200).send( { categories } );
        })
        .catch((error) => {
            next(error);
        })
}

module.exports = {
    getCategories
};
