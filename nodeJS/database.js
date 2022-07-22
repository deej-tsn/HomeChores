const Pool = require("pg").Pool;

const pool = new Pool({
    user: "macbook",
    database: "home",
    host: "localhost",
    port: 5432
});

module.exports = pool;