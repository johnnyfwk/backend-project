const seed = require('../db/seeds/seed.js');
const testData = require('../db/data/test-data/index.js');
const request = require('supertest');
const db = require('../db/connection.js');
const app = require('../app.js');

beforeEach(() => seed(testData));

afterAll(() => {
    db.end();
})

describe("Handling 404 Errors", () => {
    test("Returns a 404 status code when a path does not exist.", () => {
        return request(app)
            .get(`/api/non-existent-path`)
            .expect(404)
            .then((response) => {
                expect(response.body).toEqual( { "msg": "Path does not exist!!!!!" } );
            })
    })
})

describe("GET /api/categories", () => {
    test("Returns a 200 status code and an array of category objects each of which should have a 'slug' and 'description' property.", () => {
        return request(app)
            .get(`/api/categories`)
            .expect(200)
            .then((response) => {
                const categories = response.body.categories;
                expect(categories).toHaveLength(4);
                categories.forEach((category) => {
                    expect(category).toEqual(
                        expect.objectContaining({
                            slug: expect.any(String),
                            description: expect.any(String)
                        })
                    )
                })
            })
    })
})

describe("GET /api/reviews", () => {
    test("Returns a 200 status code and an array of review objects", () => {
        return request(app)
            .get('/api/reviews')
            .expect(200)
            .then((response) => {
                const reviews = response.body.reviews;
                expect(reviews).toHaveLength(13);
                expect(reviews).toBeSortedBy("created_at", {descending: true});
                reviews.forEach((review) => {
                    expect(review).toEqual(
                        expect.objectContaining({
                            owner: expect.any(String),
                            title: expect.any(String),
                            review_id: expect.any(Number),
                            category: expect.any(String),
                            review_img_url: expect.any(String),
                            created_at: expect.any(String),
                            votes: expect.any(Number),
                            designer: expect.any(String),
                            comment_count: expect.any(String)
                        })
                    )
                })
            })
    })
})

describe("GET /api/reviews/:review_id", () => {
    test("Returns a 200 status code and a single review object when the path includes a valid review ID.", () => {
        const REVIEW_ID = 3;
        return request(app)
            .get(`/api/reviews/${REVIEW_ID}`)
            .expect(200)
            .then((response) => {
                expect(response.body.review).toBeInstanceOf(Object);
            })
    })

    test("Returns a 404 when the review ID is valid but does not exist.", () => {
        const REVIEW_ID = 123456789;
        return request(app)
            .get(`/api/reviews/${REVIEW_ID}`)
            .expect(404)
            .then((response) => {
                expect(response.body).toEqual( { "msg": "ID is valid but does not exist!!!!!" } );
            })
    })

    test("Returns a 400 when the review ID is invalid.", () => {
        const REVIEW_ID = "invalid-id";
        return request(app)
            .get(`/api/reviews/${REVIEW_ID}`)
            .expect(400)
            .then((response) => {
                expect(response.body).toEqual( { "msg": "Query or column does not exist!!!!!" } );
            })
    })
})

describe("GET /api/reviews/:review_id/comments", () => {
    test("Returns a 200 status code and an array of comments associated with a review ID.", () => {
        const reviewId = 2;
        return request(app)
            .get(`/api/reviews/${reviewId}/comments`)
            .expect(200)
            .then((response) => {
                const commentsById = response.body.commentsById;
                expect(commentsById).toHaveLength(3);
                expect(commentsById).toBeSortedBy( "created_at", {descending: true} );
                commentsById.forEach((comment) => {
                    expect(comment).toEqual(
                        expect.objectContaining({
                            comment_id: expect.any(Number),
                            votes: expect.any(Number),
                            created_at: expect.any(String),
                            author: expect.any(String),
                            body: expect.any(String),
                            review_id: expect.any(Number)
                        })
                    )
                })
            })
    })

    test("Returns a 200 status code and an empty array when ID exists in the database but has no comments associated with it.", () => {
        const reviewId = 1;
        return request(app)
            .get(`/api/reviews/${reviewId}/comments`)
            .expect(200)
            .then((response) => {
                expect(response.body.commentsById).toEqual([]);
            })
    })

    test("Returns a 404 status code when a review ID is valid but does not exist.", () => {
        const reviewId = 123456789;
        return request(app)
            .get(`/api/reviews/${reviewId}/comments`)
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe( "ID is valid but does not exist!!!!!" );
            })
    })

    test("Returns a 400 status code when a review ID is invalid.", () => {
        const reviewId = "invalid-id";
        return request(app)
            .get(`/api/reviews/${reviewId}/comments`)
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe( "Query or column does not exist!!!!!" );
            })
        })
})

describe("POST /api/reviews/:review_id/comments", () => {
    test.only("Returns a 201 and the posted comment when review ID is valid and exists in the database.", () => {
        const reviewId = 2;
        const comment = {
            "username": "mallionaire",
            "body": "This game is supoib!!!"
        };

        return request(app)
            .post(`/api/reviews/${reviewId}/comments`)
            .send(comment)
            .expect(201)
            .then((response) => {
                expect(response.body.postedComment).toEqual({
                    "comment_id": 7,                    
                    "votes": 0,                    
                    "created_at": "2022-05-07T16:51:14.566Z",
                    "review_id": reviewId,
                    "author": "mallionaire",
                    "body": "This game is supoib!!!"
                });
            })
    })

    test("Returns a 404 status code when review ID is valid but does not exist in the database.", () => {
        const reviewId = 999999;
        const comment = {
            "username": "mallionaire",
            "body": "This game is supoib!!!"
        };
        
        return request(app)
            .post(`/api/reviews/${reviewId}/comments`)
            .send(comment)
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe( "ID is valid but does not exist!!!!!" );
            })
    })

    test("Returns a 400 status code when review ID is invalid.", () => {
        const reviewId = "an-invalid-id";
        const comment = {
            "username": "mallionaire",
            "body": "This game is supoib!!!"
        };

        return request(app)
            .post(`/api/reviews/${reviewId}/comments`)
            .send(comment)
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe( "Query or column does not exist!!!!!" );
            })
    })

    test("Returns 400 status code when a username is entered that does not exist in the database.", () => {
        const reviewId = 2;
        const comment = {
            "username": "johnnyfong",
            "body": "This game is supoib!!!"
        };

        return request(app)
            .post(`/api/reviews/${reviewId}/comments`)
            .send(comment)
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe( "Username does not exist in the database!!!!!" );
            })
    })
})








