
const config = require('knex')
require('dotenv').config() 

const knex = config({
    client: process.env.DB_CLIENT,
    connection: {
        host: process.env.DB_HOST,        
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false } // Planetscale
    },
    pool: {
        min: 0,
        max: 7
    },
    debug: false
})

module.exports = knex
