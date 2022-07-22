if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const bodyParser = require("body-parser");
const pool = require("./database");
const path = require("path");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");

const initializePassport = require("./passport-config");
initializePassport(passport, getUserByEmail, getUserById, hashedPassword);

// INIT APP
const app = express();

app.use(express.static(path.join(__dirname, 'public'))); // => req.body
app.use(bodyParser.urlencoded({extended : false}));

app.use(flash());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

async function getUserByEmail(email){
    try {
        const getPerson = await pool.query("SELECT * FROM people WHERE email = ($1)", [email]);
        if (getPerson.rows[0] == undefined) {
            return null;
        }
        return getPerson.rows[0];
    } catch (error) {
        console.log(error);
    }
    return user;
}

async function hashedPassword(email, password){
    try {
        const check = await pool.query("SELECT id FROM people WHERE email = ($1) AND password = crypt(($2), password)",
        [email, password]);
        if(check.rowCount == 1){
            return true;
        }else{
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function getUserById(id){
    user = null;
    try {
        const getPerson = await pool.query("SELECT * FROM people WHERE id = ($1)", [id]);
        user = getPerson.rows[0];
    } catch (error) {
        console.log(error);
    }
    return user;
}

// LOAD VIEW ENGINE
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// ROUTES//

//get all people

app.get("/", function(req, res){
    res.render("Home", {
        title: "Home",
        name: req.user.first_name
    });
});

app.get("/register", function(req, res){
    res.render("form", {
        title: 'Register'
    });
});

app.get("/login", function(req, res){
    res.render("login", {
        title: "Login"
    })
});

app.post("/login", passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get("/submit-form", function(req, res){
    return res.send(req.query);
});

app.get("/form_successful", function(req, res){
    res.render("form_successful", {
        title: 'Successful'
    });
});


app.post("/submit-form", function(req, res){
    return res.send(req.body);
});


app.get("/people", async(req, res) => {
    try{
        //await
        const allPeople = await pool.query("SELECT * FROM people ORDER BY id");
        //res.json(allPeople.rows);
        res.render("people", {
            title: 'People',
            people: allPeople.rows
        })
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

app.post("/form", async(req, res) => {
    try{
        //await
        console.log(req.body);
        const {first_name, second_name, email, password} = req.body;
        const newPerson = await pool.query(
            "INSERT INTO people (first_name, second_name, email, password) VALUES ($1, $2, $3, crypt($4, gen_salt('bf')))",
            [first_name, second_name, email, password]
            );
        res.redirect("/login");
    }catch (error){
        res.render("form_failure",
        {
            title: "Failure",
            error: error
        })
    }
});

app.get("/form_chore", async(req,res) => {
    const chores = await pool.query("SELECT chore_name, chore_id FROM chores");
    res.render("form_chore",{
        title: "Chorm Submission",
        chores: chores.rows
    }
    );
});

app.post("/form_chore", async(req,res) => {
    const {email, chore_id} = req.body;
    try {
        const personID =  await pool.query(
            "SELECT id FROM people WHERE email = ($1)",
            [email]
            );
        const sendRequest = await pool.query(
            "INSERT INTO person_chore (person_id, chore_id) VALUES ($1, $2)",
            [personID.row, chore_id]
            );
        res.redirect("/form_successful");
    } catch (error) {
        res.render("form_failure",
        {
            title: "Failure",
            error: error
        })
        
    }
    
});

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
app.delete("/people/:id", async(req, res) => {
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
