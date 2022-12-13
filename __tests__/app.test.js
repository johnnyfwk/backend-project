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
    test("Returns a 404 status code when the path does not exist.", () => {
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
                expect(response.body.review).toEqual( {
                    review_id: REVIEW_ID,
                    title: "Ultimate Werewolf",
                    designer: "Akihisa Okui",
                    owner: "bainesface",
                    review_img_url: "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
                    review_body: "We couldn't find the werewolf!",
                    category: "social deduction",
                    created_at: "2021-01-18T10:01:41.251Z",
                    votes: 5
                } )
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