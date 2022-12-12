const db = require('../db/connection.js');

function selectCategories() {
    return db
        .query(`SELECT * FROM categories;`)
        .then((result) => {
            return result.rows;
        })
}

module.exports = { selectCategories };