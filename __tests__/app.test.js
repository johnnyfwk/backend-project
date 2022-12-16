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
                expect(response.body).toEqual( { "msg": "The review ID you entered is not valid." } );
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
                expect(response.body.msg).toBe( "The review ID you entered is not valid." );
            })
        })
})

describe("POST /api/reviews/:review_id/comments", () => {
    test("Returns a 201 and the posted comment when review ID is valid and exists in the database.", () => {
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
                expect(response.body.comment).toMatchObject({
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
                expect(response.body.msg).toBe( "The review ID or username you entered does not exist." );
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
                expect(response.body.msg).toBe( "The review ID you entered is not valid." );
            })
    })

    test("Returns a 404 status code when a username is entered that does not exist in the database.", () => {
        const reviewId = 2;
        const comment = {
            "username": "johnnyfong",
            "body": "This game is supoib!!!"
        };

        return request(app)
            .post(`/api/reviews/${reviewId}/comments`)
            .send(comment)
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe( "The review ID or username you entered does not exist." );
            })
    })

    test("Returns a 400 status code when the comment is missing a username.", () => {
        const reviewId = 2;
        const comment = {
            "body": "This game is supoib!!!"
        };

        return request(app)
            .post(`/api/reviews/${reviewId}/comments`)
            .send(comment)
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe( "Comment is missing a username. Please include your username with your comment." );
            })
    })

    test("Returns a 400 status code when the comment is missing a body.", () => {
        const reviewId = 2;
        const comment = {
            "username": "mallionaire",
        };

        return request(app)
            .post(`/api/reviews/${reviewId}/comments`)
            .send(comment)
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe( "Comment is missing a body. Please write something for your comment." );
            })
    })

    test("Returns a 400 status code when the comment is missing both the body and username.", () => {
        const reviewId = 2;
        const comment = {};

        return request(app)
            .post(`/api/reviews/${reviewId}/comments`)
            .send(comment)
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe( "Comment is missing a body and a username. Please enter your username and write something for your comment." );
            })
    })

    test("Returns a 201 status code and the posted comment when the comment contains additional but unnecessary properties and values.", () => {
        const reviewId = 2;
        const comment = {
            "username": "mallionaire",
            "body": "This game is supoib!!!",
            "extraProp" : 'this is extra',
            "extraProp2" : 'this is also extra'
        };

        return request(app)
            .post(`/api/reviews/${reviewId}/comments`)
            .send(comment)
            .expect(201)
            .then((response) => {
                expect(response.body.comment).toMatchObject({
                    "comment_id": 7,                    
                    "votes": 0,                    
                    "created_at": "2022-05-07T16:51:14.566Z",
                    "review_id": reviewId,
                    "author": "mallionaire",
                    "body": "This game is supoib!!!"
                });
            })
    })
})

describe("PATCH /api/reviews/:review_id", () => {
    describe("Review ID:", () => {
        test("Returns a 200 status code and the updated review when the review ID is valid and exists in the database.", () => {
            const reviewId = 2;
            const newVotes = { "inc_votes": 7 };
    
            return request(app)
                .patch(`/api/reviews/${reviewId}`)
                .send(newVotes)
                .expect(200)
                .then((response) => {
                    expect(response.body.review).toMatchObject({
                        review_id: 2,
                        title: 'Jenga',
                        category: 'dexterity',
                        designer: 'Leslie Scott',
                        owner: 'philippaclaire9',
                        review_body: 'Fiddly fun for all the family',
                        review_img_url: 'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
                        created_at: '2021-01-18T10:01:41.251Z',
                        votes: 12
                    })
                })
        })

        test("Returns a 404 status code when the review ID is valid but does not exist in the database.", () => {
            const reviewId = 999999;
            const newVotes = { "inc_votes": 7 };
    
            return request(app)
                .patch(`/api/reviews/${reviewId}`)
                .send(newVotes)
                .expect(404)
                .then((response) => {
                    expect(response.body.msg).toBe( "ID is valid but does not exist." );
                })
        })

        test("Returns a 400 status code when the review ID is invalid.", () => {
            const reviewId = "an-invalid-id";
            const newVotes = { "inc_votes": 7 };
    
            return request(app)
                .patch(`/api/reviews/${reviewId}`)
                .send(newVotes)
                .expect(400)
                .then((response) => {
                    expect(response.body.msg).toBe( "The review ID you entered is not valid." );
                })
        })
    })

    describe("newVotes object:", () => {
        test("Returns a 200 status code and the updated review when the review's 'votes' property has a value of 0 or greater after adding a negative 'inc_votes' value.", () => {
            const reviewId = 2;
            const newVotes = { "inc_votes": -5 };
    
            return request(app)
                .patch(`/api/reviews/${reviewId}`)
                .send(newVotes)
                .expect(200)
                .then((response) => {
                    expect(response.body.review).toMatchObject({
                        review_id: 2,
                        title: 'Jenga',
                        category: 'dexterity',
                        designer: 'Leslie Scott',
                        owner: 'philippaclaire9',
                        review_body: 'Fiddly fun for all the family',
                        review_img_url: 'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
                        created_at: '2021-01-18T10:01:41.251Z',
                        votes: 0
                    })
                })
        })

        test("Returns a 200 status code when the 'newVotes' object contains additional but unnecessary properties and values.", () => {
            const reviewId = 2;
            const newVotes = {
                "inc_votes": 1,
                "score": 40,
                "rating": "Supoib!"
            };
    
            return request(app)
                .patch(`/api/reviews/${reviewId}`)
                .send(newVotes)
                .expect(200)
                .then((response) => {
                    expect(response.body.review).toMatchObject({
                        review_id: 2,
                        title: 'Jenga',
                        category: 'dexterity',
                        designer: 'Leslie Scott',
                        owner: 'philippaclaire9',
                        review_body: 'Fiddly fun for all the family',
                        review_img_url: 'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
                        created_at: '2021-01-18T10:01:41.251Z',
                        votes: 6
                    })
                })
        })

        test("Returns a 400 status code when the 'newVotes' object is empty.", () => {
            const reviewId = 2;
            const newVotes = {};
    
            return request(app)
                .patch(`/api/reviews/${reviewId}`)
                .send(newVotes)
                .expect(400)
                .then((response) => {
                    expect(response.body.msg).toBe( "You did not provide a valid newVotes object. Please provide one in the format { inc_votes: 1 }." );
                })
        })

        test("Returns a 400 status code when the 'newVotes' object does not include a 'inc_votes' key.", () => {
            const reviewId = 2;
            const newVotes = { "include_votes": 5 };
    
            return request(app)
                .patch(`/api/reviews/${reviewId}`)
                .send(newVotes)
                .expect(400)
                .then((response) => {
                    expect(response.body.msg).toBe( "The 'newVotes' object you provided does not include a valid 'inc_votes' key. Please provide one in the format { inc_votes: 1 }." );
                })
        })

        test("Returns a 400 status code when the 'inc_votes' value is invalid.", () => {
            const reviewId = 2;
            const newVotes = { "inc_votes": "nine" };
    
            return request(app)
                .patch(`/api/reviews/${reviewId}`)
                .send(newVotes)
                .expect(400)
                .then((response) => {
                    expect(response.body.msg).toBe( "The 'inc_votes' value you entered is invalid. Please enter a valid 'inc_votes' number." )
                })
        })

        test("Returns a 400 status code when the review's 'votes' property is less than 0 after adding a negative 'inc_votes' value.", () => {
            const reviewId = 2;
            const newVotes = { "inc_votes": -50000 };
    
            return request(app)
                .patch(`/api/reviews/${reviewId}`)
                .send(newVotes)
                .expect(400)
                .then((response) => {
                    expect(response.body.msg).toBe( "The 'inc_votes' value you entered is greater than the number of votes. Please enter a valid 'inc_votes' number." )
                })
        })
    })
})
