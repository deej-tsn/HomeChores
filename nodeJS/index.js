const express = require("express");
const app = express();
const pool = require("./database");

app.use(express.json()); // => req.body

// ROUTES//

//get all people

app.get("/people", async(req, res) => {
    try{
        //await
        const allPeople = await pool.query("SELECT * FROM people");
        res.json(allPeople.rows);
    }catch (err){
        console.log(err.message);
    }
})

//get a person by ID

app.get("/people/:id", async (req,res) => {
    const {id} = req.params;
    try {
        const getPerson = await pool.query("SELECT * FROM people WHERE id = ($1)", [id]);
        res.json(getPerson.rows);
    } catch (err) {
        console.error(err.message);
    }
})

//add a person

app.post("/people", async(req, res) => {
    try{
        //await
        const {first_name, secondName, Email } = req.body;
        const newPerson = await pool.query(
            "INSERT INTO people (first_name, second_name, email) VALUES ($1, $2, $3)",
            [first_name, secondName, Email]
            );
        res.json(newPerson);
    }catch (err){
        console.log(err.message);
    }
})

//update a person points
app.put("/people/:id", async(req, res) => {
    try{
        //await
        const {id} = req.params;
        const {newPoints} = req.body;
        const changePerson = await pool.query("UPDATE people SET point = ($1) WHERE id = ($2)", [newPoints, id]);
        res.json(id + " was updated with new points value "+ newPoints);
    }catch (err){
        console.log(err.message);
    }
})

// delete a person by ID
app.put("/people/:id", async(req, res) => {
    try{
        //await
        const {id} = req.params;
        const deletePerson = await pool.query("DELETE FROM people  WHERE id = ($1)", [id]);
        res.json(id + " was deleted");
    }catch (err){
        console.log(err.message);
    }
})

app.listen(3000, () => {
    console.log("server is listening on port 3000");
});
