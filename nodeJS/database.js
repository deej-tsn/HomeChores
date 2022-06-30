const Pool = require("pg").Pool;

const pool = new Pool({
    user: "dempseytascon",
    database: "home",
    host: "localhost",
    port: 5432
});

module.exports = pool;