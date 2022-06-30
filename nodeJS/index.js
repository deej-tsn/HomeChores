const express = require("express");
const app = express();
const pool = require("./database");

app.use(express.json()); // => req.body

// ROUTES//

//get all values

app.get("/people", async(req, res) => {
    try{
        //await
        const allPeople = await pool.query("SELECT * FROM people");
        res.json(allPeople.rows);
    }catch (err){
        console.log(err.message);
    }
})

//get a value

//create a value

app.post("/people", async(req, res) => {
    try{
        //await
        const {firstName, secondName, Email } = req.body;
        const newPerson = await pool.query(
            "INSERT INTO people (first_name, second_name, email) VALUES ($1, $2, $3)",
            [firstName, secondName, Email]
            );
        res.json(newPerson);
    }catch (err){
        console.log(err.message);
    }
})

//update a value

//

app.listen(3000, () => {
    console.log("server is listening on port 3000");
});
