if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// IMPORTS 
const express = require("express");
const bodyParser = require("body-parser");
const pool = require("./database");
const path = require("path");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const initializePassport = require("./passport-config");
initializePassport(passport, getUserByEmail, getUserById, hashedPassword);

// INIT APP
const app = express();

// CONFIG APP
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
app.use(methodOverride("_method"));

// EXTRA FUNCTIONS

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

// LOAD VIEW ENGINE
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// ROUTES//

// HOME

app.get("/", checkAuthenicated , async (req, res) =>{
    const user = await req.user;
    res.render("Home", {
        title: "Home",
        name: user.first_name
    });
});

// REGISTER

app.get("/register", checkNotAuthenicated ,function(req, res){
    res.render("register", {
        title: 'Register'
    });
});

app.post("/register", async(req, res) => {
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

// LOGIN 

app.get("/login", checkNotAuthenicated ,function(req, res){
    res.render("login", {
        title: "Login"
    })
});

app.post("/login", checkNotAuthenicated,passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

// LOGOUT 

app.delete('/logout', function (req, res, next) {
    req.logOut(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect('/login');
    });
  });

  // View Chores

app.get("/viewChores", checkAuthenicated, async(req,res) =>{
    const chores = await pool.query("SELECT first_name, second_name,chore_name, TO_CHAR(date_time, 'DD/MM/YYYY') AS date, TO_CHAR(date_time, 'HH24:MI') AS time FROM people INNER JOIN person_chore ON person_chore.person_id = people.id INNER JOIN chores ON chores.chore_id = person_chore.chore_id ORDER BY date_time DESC");
    console.log(chores.rows);
    res.render("viewChores",{
        title: "Chores",
        chores: chores.rows
    }
    );
});

app.get("/viewPoints", checkAuthenicated, async(req,res) =>{
    const points = await pool.query("SELECT first_name, second_name, point FROM people ORDER BY point DESC");
    res.render("viewPoints",{
        title: "Points",
        chores: points.rows
    }
    );
});


// ADD a chore a person has done

app.get("/add_person_chore", checkAuthenicated, async(req,res) => {
    const chores = await pool.query("SELECT chore_name, chore_id FROM chores");
    res.render("addChore",{
        title: "Add Chore",
        chores: chores.rows
    }
    );
});

app.post("/add_person_chore", checkAuthenicated, async(req,res) => {
    const user = await req.user;
    const {chore} = req.body;
    try {
        const sendRequest = await pool.query(
            "INSERT INTO person_chore (person_id, chore_id) VALUES ($1, $2)",
            [user.id, chore]
            );
        res.redirect("/");
    } catch (error) {
        console.log(error);
    }
});

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

// Check if Logged In or Not

function checkAuthenicated(req, res, next){
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function checkNotAuthenicated(req, res, next){
    if (req.isAuthenticated()){
        return res.redirect("/");
    }
    next();
}

app.listen(3000, '0.0.0.0', () => {
    console.log("server is listening on port 3000");
});