const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../src/app')
const knex = require('knex')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

describe('Test Setup', () => {

    function getUsersTestData() {
        return [
            {
                id: 1,
                username: 'testuser',
                password: bcrypt.hashSync('password', bcrypt.genSaltSync())
            }
        ];
    }

    function seedUsers(db) {
        return db('recipro_users').insert(getUsersTestData());
    }

    function cleanTables(db) {
        return db.raw(`
            TRUNCATE recipro_users, recipro_favorites CASCADE
        `);
    }

    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL
        });
        app.set('db', db);
    })

    afterEach('clean tables', () => cleanTables(db));

    after('disconnect from db', () => {
        cleanTables(db);
        db.destroy();
    })

    before('cleanup', () => cleanTables(db));

    beforeEach('seed users', () => {
        return seedUsers(db);
    });

    function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
        const token = jwt.sign({ user_id: user.id }, secret, {
            subject: user.user_name,
            algorithm: 'HS256',
        })
        return `Bearer ${token}`
    }

    const testUser = {
        userId: 4
    }

    context('App', () => {
        it('GET / responds with 200 containing "Hello, world!"', () => {
            return supertest(app)
                .get('/')
                .expect(200, 'Hello, world!')
        })
    })

    context('Favorites', () => {
        it('responds with 401 unauthorized', () => {
            return supertest(app)
                .get('/favorites')
                .expect(401)
        })
    })

    context('Favorites', () => {
        it('responds with 200 authorized', () => {
            return supertest(app)
                .get('/favorites')
            set('Authorization', makeAuthHeader(testUser))
                .expect(200)
        })
    })

    context('Users', () => {
        it('responds with 400 missing fields in request body', () => {
            return supertest(app)
                .post('/users')
                .expect(400)
        })
    })

    context('Users', () => {
        it('Registers a new user successfully', () => {
            const newUser = {
                password: 'Password1!',
                username: 'qtest'
            }
            return supertest(app)
                .post('/users')
                .send(newUser)
                .expect(201)
        });
    })

    context('Auth login', () => {
        it('responds with 200 and JWT auth token using secret when given valid credentials', () => {
            const validUser = {
                username: 'testuser',
                password: 'password'
            }
            return supertest(app)
                .post('/auth/login')
                .send(validUser)
                .expect(200)
        });
    })
})
