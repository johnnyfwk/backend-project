const { selectCategories } = require('../models/categories.js');

function getCategories(req, res) {
    selectCategories()
        .then((categories) => {
            res.status(200).send( { categories } );
        })
        .catch((err) => {
            next(err);
        })
}

module.exports = { getCategories };