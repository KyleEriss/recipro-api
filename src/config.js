module.exports = {
    PORT: process.env.PORT || 8000,
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:3000/api",
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres@localhost/recipro',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://postgres@localhost/recipro',
    JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
}