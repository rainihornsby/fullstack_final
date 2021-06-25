const express = require('express');

const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
require("dotenv").config();
const app = express();
const initializePassport = require("./passportConfig")

initializePassport(passport);

const PORT = process.env.PORT || 8080;

app.get('/', (req, res)=>{
    res.render('index');
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'secret', 
    resave: false,
    // saves session details
    saveUninitialized: false

})
);
// use passport
app.use(passport.initialize());
app.use(passport.session());
// express flash
app.use(flash());

// home endpoint
app.get('/users/index', (req, res)=>{
    res.render("index");
});

// register endpoint
app.get('/users/register', checkAuthentication, (req, res)=>{
    res.render("register");
});

// login endpoint
app.get('/users/login', checkAuthentication, (req, res)=>{
    res.render("login");
});

// dashboard endpoint
app.get('/users/dashboard', checkNotAuthenticated, (req, res)=>{
    res.render("dashboard", {user: req.user.name});
});

// for logging out
app.get("/users/logout", (req, res)=>{
    // logOut() is afunction I get from passport
    req.logOut();
    req.flash("success_msg", "You have logged out");
    res.redirect("/users/login");
});

app.post('/users/register', async (req, res)=>{
    let {name, email, password, password2} = req.body;

    

    console.log({
        name,
        email,
        password,
        password2
    });

    let errors = [];

    // warning for if all fields are empty
    if(!name || !email || !password || !password2){
        errors.push({message: "Please enter all feilds"})
    }

    // set password rules
    if(password.length < 5){
        errors.push({message: "Password should be at least 5 letters"})
    }

    // if the password doesn't match with the confirm password
    if(password != password2){
        errors.push({message: "Passwords do not match"})
    }

    if(errors.length > 0){
        res.render("register", {errors})
    }else{
        // Form validation has passed
        let hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

        pool.query(
            `SELECT * FROM users 
            WHERE email = $1`, 
            [email], 
            (err, results)=>{
                if(err){
                    throw err
                }
                console.log(results.rows)
                // if statement for already registered emails
                if(results.rows.length > 0) {
                    errors.push({message: "Email already registered" });
                    res.render("register", { errors });
                }else{
                    pool.query(
                        `INSERT INTO users (name, email, password)
                        VALUES ($1, $2, $3)
                        RETURNING id, password`,
                        [name, email, hashedPassword], 
                        (err, results)=>{
                            if(err){
                                throw err
                            }
                            console.log(results.rows);
                            req.flash("success_msg", "You are now registered. Please log in");
                            res.redirect("/users/login");
                        }
                    );
                }
            }
        );
    }
});

app.post("/users/login", passport.authenticate('local', {
    // this directs to dashboard if log in is sucessful
    successRedirect: "/users/dashboard",
    // this directs back to the login page if login fails
    failureRedirect: "/users/login",
    failureFlash: true
}));


// checks authentication
function checkAuthentication(req, res, next){
    // method from passport
    if(req.isAuthenticated()){
        return res.redirect("/users/dashboard");
    }
    next();
}

// checks to see if not authenticated, directs to login
function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }

    res.redirect('/users/login')
}

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
});

