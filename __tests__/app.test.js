const seed = require('../db/seeds/seed.js');
const testData = require('../db/data/test-data/index.js');
const request = require('supertest');
const db = require('../db/connection.js');
const app = require('../app.js');

beforeEach(() => seed(testData));

afterAll(() => {
    db.end();
})

describe("GET /api/categories", () => {
    test("Returns a 200 status code and an array of category objects each of which should have a 'slug' and 'description' property.", () => {
        return request(app)
            .get(`/api/categories`)
            .expect(200)
            .then((response) => {
                const categories = response.body.categories;
                expect(categories).toBeInstanceOf(Array);
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

    test("Returns a 404 status code when the path does not exist.", () => {
        return request(app)
            .get(`/api/random-path`)
            .expect(404)
            .then((response) => {
                expect(response.body).toEqual( { "msg": "Path does not exist!!!!!" } );
            })
    })
})