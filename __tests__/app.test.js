const request = require('supertest');
const app = require('../app');
const db = require('../db/connection.js');
const seed = require('../db/seeds/seed.js');
const testData = require('../db/data/test-data/index.js');

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("Handling 404 Errors", () => {
    test("Returns a 404 status code when a path does not exist.", () => {
        return request(app)
            .get('/api/not-existent-path')
            .expect(404)
            .then((response) => {
                expect(response.body).toEqual( { "msg": "This path does not exist!" } );
            })
    })
})

describe("GET /api/categories", () => {
    test("Responds with a 200 status code and an array of category objects where each object contains the following properties: 'slug' and 'description'.", () => {
        return request(app)
            .get('/api/categories')
            .expect(200)
            .then((response) => {
                const categories = response.body.categories;
                expect(categories).toHaveLength(4);
                categories.forEach((category) => {
                    expect(category).toEqual(
                        expect.objectContaining({
                            "slug": expect.any(String),
                            "description": expect.any(String)
                        })
                    )
                })
            })
    })
})

describe("GET /api/reviews", () => {
    test("Responds with a 200 status code and an array of review objects sorted in descending order, and each object contains the following properties: owner, title, review_id, category, review_img_url, created_at, votes, designer, and comment_count.", () => {
        return request(app)
            .get('/api/reviews')
            .expect(200)
            .then((response) => {
                const reviews = response.body.reviews;
                expect(reviews).toHaveLength(13);
                expect(reviews).toBeSortedBy( "created_at", { descending: true } );
                reviews.forEach((review) => {
                    expect(review).toEqual(
                        expect.objectContaining({
                            "owner": expect.any(String),
                            "title": expect.any(String),
                            "review_id": expect.any(Number),
                            "category": expect.any(String),
                            "review_img_url": expect.any(String),
                            "created_at": expect.any(String),
                            "votes": expect.any(Number),
                            "designer": expect.any(String),
                            "comment_count": expect.any(Number)
                        })
                    )
                })
            })
    })
})

describe("GET /api/reviews/:review_id", () => {
    test("Responds with a 200 status code and a single review object containing the following properties: review_id, title, review_body, designer, review_image_url, votes, category, owner, and created_at.", () => {
        const reviewId = 3;
        return request(app)
            .get(`/api/reviews/${reviewId}`)
            .expect(200)
            .then((response) => {
                expect(response.body.review).toMatchObject({
                    "review_id": reviewId,
                    "title": expect.any(String),
                    "review_body": expect.any(String),
                    "designer": expect.any(String),
                    "review_img_url": expect.any(String),
                    "votes": expect.any(Number),
                    "category": expect.any(String),
                    "owner": expect.any(String),
                    "created_at": expect.any(String)
                })
            })
    })

    test("Responds with a 404 status code when the review ID in the path is valid but does not exist in the database.", () => {
        const reviewId = 99999;
        return request(app)
            .get(`/api/reviews/${reviewId}`)
            .expect(404)
            .then((response) => {
                expect(response.body).toEqual( { "msg": "The review ID in the path is valid but does not exist."} )
            })
    })

    test("Responds with a 400 status code when the review ID in the path is invalid.", () => {
        const reviewId = `an-invalid-review-id`;
        return request(app)
            .get(`/api/reviews/${reviewId}`)
            .expect(400)
            .then((response) => {
                expect(response.body).toEqual( { "msg": "The review or comment ID is invalid."} )
            })
    })
})

describe("GET /api/reviews/:review_id/comments", () => {
    test("Responds with a 200 status code and an array of comment objects associated with a specific review ID.", () => {
        const reviewId = 2;
        return request(app)
            .get(`/api/reviews/${reviewId}/comments`)
            .expect(200)
            .then((response) => {
                const comments = response.body.comments;
                expect(comments).toBeSortedBy( 'created_at', { descending: true } );
                comments.forEach((comment) => {
                    expect(comment).toMatchObject({
                        "comment_id": expect.any(Number),
                        "votes": expect.any(Number),
                        "created_at": expect.any(String),
                        "author": expect.any(String),
                        "body": expect.any(String),
                        "review_id": reviewId
                    })
                })
            })
    })

    test("Responds with a 200 status code when there are no comments associated with a review ID that exists in the database.", () => {
        const reviewId = 4;
        return request(app)
            .get(`/api/reviews/${reviewId}/comments`)
            .expect(200)
            .then((response) => {
                expect(response.body).toEqual( { "msg": "There are no comments associated with that review ID." } );
            })
    })

    test("Responds with a 404 status code when the review ID is valid but does not exist in the database.", () => {
        const reviewId = 999999;
        return request(app)
            .get(`/api/reviews/${reviewId}/comments`)
            .expect(404)
            .then((response) => {
                expect(response.body).toEqual( { "msg": "That review ID does not exist." } );
            })
    })

    test("Responds with a 400 status code when the review ID is invalid.", () => {
        const reviewId = `an-invalid-review-id`;
        return request(app)
            .get(`/api/reviews/${reviewId}/comments`)
            .expect(400)
            .then((response) => {
                expect(response.body).toEqual( { "msg": "The review or comment ID is invalid." } );
            })
    })
})

describe("POST /api/reviews/:review_id/comments", () => {
    describe("Successful Posts:", () => {
        test("Responds with a 201 status code and the comment when an object is posted with the following properties: username and body.", () => {
            const reviewId = 2;
            const commentToPost = {
                "username": "mallionaire",
                "body": "Easily the best game ever!!!"
            };    
            return request(app)
                .post(`/api/reviews/${reviewId}/comments`)
                .send(commentToPost)
                .expect(201)
                .then((response) => {
                    expect(response.body.comment).toMatchObject({
                        "comment_id": expect.any(Number),
                        "body": expect.any(String),
                        "votes": expect.any(Number),
                        "author": expect.any(String),
                        "review_id": reviewId,
                        "created_at": expect.any(String)
                    });
                })
        })
    
        test("Responds with a 201 status code and the comment when the comment object is posted with additional but unnecessary properties and values.", () => {
            const reviewId = 2;
            const commentToPost = {
                "username": "mallionaire",
                "body": "Easily the best game ever!!!",
                "extra_property_1": "Extra value 1",
                "extra_property_2": "Extra value 2"
            };    
            return request(app)
                .post(`/api/reviews/${reviewId}/comments`)
                .send(commentToPost)
                .expect(201)
                .then((response) => {
                    expect(response.body.comment).toMatchObject({
                        "comment_id": expect.any(Number),
                        "body": expect.any(String),
                        "votes": expect.any(Number),
                        "author": expect.any(String),
                        "review_id": reviewId,
                        "created_at": expect.any(String)
                    });
                })
        })
    })

    describe("Review IDs:", () => {
        test("Responds with a 404 status code when the review ID is valid but does not exist in the database.", () => {
            const reviewId = 99999;
            const commentToPost = {
                "username": "mallionaire",
                "body": "Easily the best game ever!!!"
            };    
            return request(app)
                .post(`/api/reviews/${reviewId}/comments`)
                .send(commentToPost)
                .expect(404)
                .then((response) => {
                    expect(response.body).toEqual( { "msg": "The review ID or username does not exist." } );
                })
        })
    
        test("Responds with a 400 status code when a review ID is invalid.", () => {
            const reviewId = `an-invalid-review-id`;
            const commentToPost = {
                "username": "mallionaire",
                "body": "Easily the best game ever!!!"
            };    
            return request(app)
                .post(`/api/reviews/${reviewId}/comments`)
                .send(commentToPost)
                .expect(400)
                .then((response) => {
                    expect(response.body).toEqual( { "msg": "The review or comment ID is invalid." } );
                })
        })
    })
    
    describe("Comment object:", () => {
        test("Responds with a 404 status code when the username does not exist in the database.", () => {
            const reviewId = `2`;
            const commentToPost = {
                "username": "johnnyfong",
                "body": "Easily the best game ever!!!"
            };    
            return request(app)
                .post(`/api/reviews/${reviewId}/comments`)
                .send(commentToPost)
                .expect(404)
                .then((response) => {
                    expect(response.body).toEqual( { "msg": "The review ID or username does not exist." } );
                })
        })
    
        test("Responds with a 400 status code when the comment object is empty.", () => {
            const reviewId = 2;
            const commentToPost = {};    
            return request(app)
                .post(`/api/reviews/${reviewId}/comments`)
                .send(commentToPost)
                .expect(400)
                .then((response) => {
                    expect(response.body).toEqual( { "msg": "You did not enter your username or comment. Please enter both your username and comment." } );
                })
        })
    
        test("Responds with a 400 status code when the comment object has a username property and valid value but is missing the body property.", () => {
            const reviewId = 2;
            const commentToPost = { "username": "mallionaire" };    
            return request(app)
                .post(`/api/reviews/${reviewId}/comments`)
                .send(commentToPost)
                .expect(400)
                .then((response) => {
                    expect(response.body).toEqual( { "msg": "You did not enter your comment. Please enter a comment." } );
                })
        })
    
        test("Responds with a 400 status code when the comment object has a comment property and valid value but is missing the username property.", () => {
            const reviewId = 2;
            const commentToPost = { "body": "Easily the best game ever!!!" };    
            return request(app)
                .post(`/api/reviews/${reviewId}/comments`)
                .send(commentToPost)
                .expect(400)
                .then((response) => {
                    expect(response.body).toEqual( { "msg": "You did not enter your username. Please enter your username." } );
                })
        })
    })
})

describe("PATCH /api/reviews/:review_id", () => {
    describe("Successful patches:", () => {
        test("Responds with a 200 status code and a review object with the updated votes.", () => {
            const reviewId = 2;
            const newVotes = { "inc_votes": 5 };    
            return request(app)
                .patch(`/api/reviews/${reviewId}`)
                .send(newVotes)
                .expect(200)
                .then((response) => {
                    expect(response.body.review).toMatchObject({
                        "review_id": reviewId,
                        "title": expect.any(String),
                        "category": expect.any(String),
                        "designer": expect.any(String),
                        "owner": expect.any(String),
                        "review_body": expect.any(String),
                        "review_img_url": expect.any(String),
                        "created_at": expect.any(String),
                        "votes": expect.any(Number)
                    })
                })
        })
    
        test("Responds with a 200 status code and a review object when the votes object contains additional but unnecessary properties and values.", () => {
            const reviewId = 2;
            const newVotes = {
                "inc_votes": 5,
                "extra_property_1": "extra_value_1",
                "extra_property_2": "extra_value_2"
            };    
            return request(app)
                .patch(`/api/reviews/${reviewId}`)
                .send(newVotes)
                .expect(200)
                .then((response) => {
                    expect(response.body.review).toMatchObject({
                        "review_id": reviewId,
                        "title": expect.any(String),
                        "category": expect.any(String),
                        "designer": expect.any(String),
                        "owner": expect.any(String),
                        "review_body": expect.any(String),
                        "review_img_url": expect.any(String),
                        "created_at": expect.any(String),
                        "votes": expect.any(Number)
                    })
                })
        })
    })

    describe("Review IDs:", () => {
        test("Responds with a 404 status code when the review ID is valid but does not exist in the database.", () => {
            const reviewId = 99999;
            const newVotes = { "inc_votes": 5 };    
            return request(app)
                .patch(`/api/reviews/${reviewId}`)
                .send(newVotes)
                .expect(404)
                .then((response) => {
                    expect(response.body).toEqual( { "msg": "The review ID does not exist." } );
                })
        })
    
        test("Responds with a 400 status code when the review ID is invalid.", () => {
            const reviewId = `an-invalid-review-id`;
            const newVotes = { "inc_votes": 5 };    
            return request(app)
                .patch(`/api/reviews/${reviewId}`)
                .send(newVotes)
                .expect(400)
                .then((response) => {
                    expect(response.body).toEqual( { "msg": "The review or comment ID is invalid." } );
                })
        })
    })
    
    describe("Votes object: ", () => {
        test("Responds with a 400 status code when the votes object does not include the 'inc_votes' property.", () => {
            const reviewId = 2;
            const newVotes = {};    
            return request(app)
                .patch(`/api/reviews/${reviewId}`)
                .send(newVotes)
                .expect(400)
                .then((response) => {
                    expect(response.body).toEqual( { "msg": "The votes object does not include the 'inc_votes' property. Please include the 'inc_votes' property and the number of votes to add." } );
                })
        })
    
        test("Responds with a 400 status code when the value for the inc_votes property is not a number.", () => {
            const reviewId = 2;
            const newVotes = { "inc_votes": "banana" };    
            return request(app)
                .patch(`/api/reviews/${reviewId}`)
                .send(newVotes)
                .expect(400)
                .then((response) => {
                    expect(response.body).toEqual( { "msg": "The 'inc_votes' value is invalid. Please enter a number for the 'inc_votes' property." } );
                })
        })
    
        test("Responds with a 400 status code when the review object's votes value is less than 0 after adding a negative inc_votes value to it.", () => {
            const reviewId = 2;
            const newVotes = { "inc_votes": -99999 };    
            return request(app)
                .patch(`/api/reviews/${reviewId}`)
                .send(newVotes)
                .expect(400)
                .then((response) => {
                    expect(response.body).toEqual( { "msg": "The 'inc_votes' value you entered is greater than the number of votes. Please enter a valid number." } );
                })
        })
    })
})

describe("GET /api/users", () => {
    test("Responds with a 200 status code and an array of user objects, with each object containing the following properties: username, name, and avatar_url.", () => {
        return request(app)
            .get('/api/users')
            .expect(200)
            .then((response) => {
                const users = response.body.users;
                expect(users).toHaveLength(4);
                users.forEach((user) => {
                    expect(user).toMatchObject({                        
                        "username": expect.any(String),
                        "name": expect.any(String),
                        "avatar_url": expect.any(String)
                    })
                })
            })
    })
})

describe("GET /api/reviews (queries)", () => {
    describe("Successful (200) Requests:", () => {
        test("Responds with a 200 status code and an array of all review objects sorted by 'created_at' in descending order by default when no queries are appended to the path.", () => {
            return request(app)
                .get('/api/reviews')
                .expect(200)
                .then((response) => {
                    const reviews = response.body.reviews;
                    expect(reviews).toHaveLength(13);
                    expect(reviews).toBeSortedBy("created_at", { descending: true } );
                    reviews.forEach((review) => {
                        expect(review).toMatchObject({
                            "owner": expect.any(String),
                            "title": expect.any(String),
                            "review_id": expect.any(Number),
                            "category": expect.any(String),
                            "review_img_url": expect.any(String),
                            "created_at": expect.any(String),
                            "votes": expect.any(Number),
                            "designer": expect.any(String),
                            "review_body": expect.any(String)
                        })
                    })
                })
        })

        test("Responds with a 200 status code and an array of review objects filtered by category that is sorted by 'created_at' in descending order when only the category is appended to the path.", () => {
            const category = `social deduction`;
            const categoryConvertedToPath = category.replaceAll(" ", "-");            
            return request(app)
                .get(`/api/reviews?category=${categoryConvertedToPath}`)
                .expect(200)
                .then((response) => {                
                    const reviews = response.body.reviews;
                    expect(reviews).toBeSortedBy( "created_at", { descending: true } );
                    reviews.forEach((review) => {
                        expect(review).toMatchObject({
                            "owner": expect.any(String),
                            "title": expect.any(String),
                            "review_id": expect.any(Number),
                            "category": category,
                            "review_img_url": expect.any(String),
                            "created_at": expect.any(String),
                            "votes": expect.any(Number),
                            "designer": expect.any(String),
                            "review_body": expect.any(String)
                        })
                    })
                })
        })

        test("Responds with a 200 status code and an array of all review objects sorted by a specified review object property in descending order when only the 'sort_by' property and value is appended to the path.", () => {
            const sortBy = `votes`;            
            return request(app)
                .get(`/api/reviews?sort_by=${sortBy}`)
                .expect(200)
                .then((response) => {                
                    const reviews = response.body.reviews;
                    expect(reviews).toHaveLength(13);
                    expect(reviews).toBeSortedBy( sortBy, { descending: true } );
                    reviews.forEach((review) => {
                        expect(review).toMatchObject({
                            "owner": expect.any(String),
                            "title": expect.any(String),
                            "review_id": expect.any(Number),
                            "category": expect.any(String),
                            "review_img_url": expect.any(String),
                            "created_at": expect.any(String),
                            "votes": expect.any(Number),
                            "designer": expect.any(String),
                            "review_body": expect.any(String)
                        })
                    })
                })
        })

        test("Responds with a 200 status code and an array of review objects sorted by 'created_at' in a specified order when only the 'order' property and value is appended to the path.", () => {
            const order = "desc";
            const descending = order === "asc" ? false : true;            
            return request(app)
                .get(`/api/reviews?order=${order}`)
                .expect(200)
                .then((response) => {                
                    const reviews = response.body.reviews;
                    expect(reviews).toHaveLength(13);
                    expect(reviews).toBeSortedBy( "created_at", { descending: descending } );
                    reviews.forEach((review) => {
                        expect(review).toMatchObject({
                            "owner": expect.any(String),
                            "title": expect.any(String),
                            "review_id": expect.any(Number),
                            "category": expect.any(String),
                            "review_img_url": expect.any(String),
                            "created_at": expect.any(String),
                            "votes": expect.any(Number),
                            "designer": expect.any(String),
                            "review_body": expect.any(String)
                        })
                    })
                })
        })

        test("Responds with a 200 status code and an array of review objects filtered by category and sorted by sort_by property in descending order when category and sort_by queries are appended to the path.", () => {
            const category = `social deduction`;
            const categoryConvertedToPath = category.replaceAll(" ", "-");
            const sortBy = `votes`;
            return request(app)
                .get(`/api/reviews?category=${categoryConvertedToPath}&sort_by=${sortBy}`)
                .expect(200)
                .then((response) => {
                    const reviews = response.body.reviews;
                    expect(reviews).toBeSortedBy( sortBy, { descending: true } );
                    reviews.forEach((review) => {
                        expect(review).toMatchObject({
                            "owner": expect.any(String),
                            "title": expect.any(String),
                            "review_id": expect.any(Number),
                            "category": category,
                            "review_img_url": expect.any(String),
                            "created_at": expect.any(String),
                            "votes": expect.any(Number),
                            "designer": expect.any(String),
                            "review_body": expect.any(String)
                        })
                    })
                })
        })

        test("Responds with a 200 status code and an array of review objects filtered by category and sorted by 'created_at' in a specified order when category and order queries are appended to the path.", () => {
            const category = `social deduction`;
            const categoryConvertedToPath = category.replaceAll(" ", "-");
            const order = "desc";
            const descending = order === "asc" ? false : true;
            return request(app)
                .get(`/api/reviews?category=${categoryConvertedToPath}&order=${order}`)
                .expect(200)
                .then((response) => {
                    const reviews = response.body.reviews;
                    expect(reviews).toBeSortedBy( "created_at", { descending: descending } );
                    reviews.forEach((review) => {
                        expect(review).toMatchObject({
                            "owner": expect.any(String),
                            "title": expect.any(String),
                            "review_id": expect.any(Number),
                            "category": category,
                            "review_img_url": expect.any(String),
                            "created_at": expect.any(String),
                            "votes": expect.any(Number),
                            "designer": expect.any(String),
                            "review_body": expect.any(String)
                        })
                    })
                })
        })

        test("Responds with a 200 status code and an array of all review objects filtered by category and sorted in a specified order when sort_by and order queries are appended to the path.", () => {
            const sortBy = `votes`;
            const order = "desc";
            const descending = order === "asc" ? false : true;
            return request(app)
                .get(`/api/reviews?sort_by=${sortBy}&order=${order}`)
                .expect(200)
                .then((response) => {
                    const reviews = response.body.reviews;
                    expect(reviews).toHaveLength(13);
                    expect(reviews).toBeSortedBy( sortBy, { descending: descending } );
                    reviews.forEach((review) => {
                        expect(review).toMatchObject({
                            "owner": expect.any(String),
                            "title": expect.any(String),
                            "review_id": expect.any(Number),
                            "category": expect.any(String),
                            "review_img_url": expect.any(String),
                            "created_at": expect.any(String),
                            "votes": expect.any(Number),
                            "designer": expect.any(String),
                            "review_body": expect.any(String)
                        })
                    })
                })
        })
    })

    describe("Category:", () => {
        test("Responds with a 404 status code when the category query is valid but does not exist in the database.", () => {
            const category = `a valid but non existent category`;
            const categoryConvertedToPath = category.replaceAll(" ", "-");    
            return request(app)
                .get(`/api/reviews?category=${categoryConvertedToPath}`)
                .expect(404)
                .then((response) => {
                    expect(response.body).toEqual( { "msg": "The category does not exist." } );
                })
        })
    
        test("Responds with a 400 status code when the category query is a number.", () => {
            const category = 6;    
            return request(app)
                .get(`/api/reviews?category=${category}`)
                .expect(400)
                .then((response) => {
                    expect(response.body).toEqual( { "msg": "The category is invalid. Please enter a valid category name." } );
                })
        })
    
        test("Responds with a 400 status code when the category query is an empty string.", () => {
            const category = "";    
            return request(app)
                .get(`/api/reviews?category=${category}`)
                .expect(400)
                .then((response) => {
                    expect(response.body).toEqual( { "msg": "You entered a category with no value. Please enter a valid category." } );
                })
        })
    })

    describe("Sort By:", () => {
        test("Responds with a 404 status code when the sort_by query is valid but does not exist in the database.", () => {
            const sortBy = `a_valid_but_non_existent_sort_by`;    
            return request(app)
                .get(`/api/reviews?sort_by=${sortBy}`)
                .expect(404)
                .then((response) => {
                    expect(response.body).toEqual( { "msg": "The sort_by does not exist." } );
                })
        })
    
        test("Responds with a 400 status code when the sort_by query is a number.", () => {
            const sortBy = 6;    
            return request(app)
                .get(`/api/reviews?sort_by=${sortBy}`)
                .expect(400)
                .then((response) => {
                    expect(response.body).toEqual( { "msg": "The sort_by is invalid. Please enter a valid sort_by name." } );
                })
        })
    
        test("Responds with a 400 status code when the sort_by query is an empty string.", () => {
            const sortBy = "";    
            return request(app)
                .get(`/api/reviews?sort_by=${sortBy}`)
                .expect(400)
                .then((response) => {
                    expect(response.body).toEqual( { "msg": "You entered a sort_by with no value. Please enter a valid sort_by." } );
                })
        })
    })

    describe("Order:", () => {
        test("Responds with a 404 status code when the order does not exist.", () => {
            const order = `a_non_existent_order`;    
            return request(app)
                .get(`/api/reviews?order=${order}`)
                .expect(404)
                .then((response) => {
                    expect(response.body).toEqual( { "msg": "The order does not exist. Please enter a valid order value." } );
                })
        })
    
        test("Responds with a 400 status code when the order is a number.", () => {
            const order = 6;    
            return request(app)
                .get(`/api/reviews?order=${order}`)
                .expect(400)
                .then((response) => {
                    expect(response.body).toEqual( { "msg": "The order is invalid. Please enter a valid order value." } );
                })
        })
    
        test("Responds with a 400 status code when the order is an empty string.", () => {
            const order = "";    
            return request(app)
                .get(`/api/reviews?order=${order}`)
                .expect(400)
                .then((response) => {
                    expect(response.body).toEqual( { "msg": "You entered an order with no value. Please enter a valid order value." } );
                })
        })
    })
})

describe("GET /api/reviews/:review_id (comment count)", () => {
    test("Responds with a 200 status code and an review object that includes a 'comment_count' property with the total count of comments associated with that review ID.", () => {
        const reviewId = 2;
         return request(app)
            .get(`/api/reviews/${reviewId}`)
            .expect(200)
            .then((response) => {
                expect(response.body.review).toMatchObject({
                    "review_id": reviewId,
                    "title": expect.any(String),
                    "review_body": expect.any(String),
                    "designer": expect.any(String),
                    "review_img_url": expect.any(String),
                    "votes": expect.any(Number),
                    "category": expect.any(String),
                    "owner": expect.any(String),
                    "created_at": expect.any(String),
                    "comment_count": expect.any(Number)
                })
            })
    })

    test("Responds with a 404 status code when the review ID is valid but does not exist in the datatbase.", () => {
        const reviewId = 99999;
        return request(app)
        .get(`/api/reviews/${reviewId}`)
        .expect(404)
        .then((response) => {
            expect(response.body).toEqual( { "msg": "The review ID in the path is valid but does not exist." } );
        })
    })

    test("Responds with a 400 status code when the review ID is invalid.", () => {
        const reviewId = 'an-invalid-review-id';
        return request(app)
        .get(`/api/reviews/${reviewId}`)
        .expect(400)
        .then((response) => {
            expect(response.body).toEqual( { "msg": "The review or comment ID is invalid." } );
        })
    })
})

describe("DELETE /api/comments/:comment_id", () => {
    test("Responds with a 204 status code and a confirmation message to let the user know that a comment with a specific comment ID has been deleted from the database.", () => {
        const commentID = 1;
        return request(app)
            .delete(`/api/comments/${commentID}`)
            .expect(204)
            .then((response) => {
                expect(response.noContent).toBe(true);
            })
    })

    test("Responds with a 404 status code when the comment ID is valid but does not exist in the database.", () => {
        const commentID = 99999;
        return request(app)
            .delete(`/api/comments/${commentID}`)
            .expect(404)
            .then((response) => {
                expect(response.body).toEqual( { "msg": "The comment ID does not exist." } );
            })
    })

    test("Responds with a 400 status code when the comment ID is invalid.", () => {
        const commentID = 'an-invalid-comment-id';
        return request(app)
            .delete(`/api/comments/${commentID}`)
            .expect(400)
            .then((response) => {
                expect(response.body).toEqual( { "msg": "The review or comment ID is invalid." } );
            })
    })

    test("Responds with a 404 status code when the comment ID is an empty string.", () => {
        const commentID = '';
        return request(app)
            .delete(`/api/comments/${commentID}`)
            .expect(404)
            .then((response) => {
                expect(response.body).toEqual( { "msg": "This path does not exist!" } );
            })
    })
})
