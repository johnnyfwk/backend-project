\c nc_games

SELECT * FROM categories;
SELECT * FROM users;
SELECT * FROM reviews;
SELECT * FROM comments;

SELECT * FROM reviews
JOIN comments
ON reviews.review_id = comments.review_id;