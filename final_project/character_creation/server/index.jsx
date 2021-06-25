const express = require("express");
const app = express();
const mysql = require("mysql")
const cors = require("cors");

app.use(cors());
app.use(express.json());


// database - include all the database info
const db = mysql.createConnection({
    user: "postgres",
    host:  "localhost",
    password: "Prestigious!",
    database: "user_created_characters",
});

// request and response method, if you want something sent to the frontend from the backend use req
// if you want to send something to the frontend to the backend use res
// variable I'm sending to the database
app.post("/create", (req, res)=>{
    // console.log(req.body);
    const name = req.body.name;
    const race = req.body.race;
    const age = req.body.age;
    const specialization = req.body.specialization;
    const deity = req.body.deity;

// first value in the array is the first "?", second is second "?" and so on
// the ? is for security, represents variables, the standard
    db.query(
    "INSERT INTO characters (name, race, age, specialization, deity) VALUES (?,?,?,?,?)", 
    [name, race, age, specialization, deity], 
    (err, res)=>{
        if(err){
            console.log(err)
        }else{
            res.send("Values Inserted")
        }
    });
});

// gets the full list of characters made
    app.get("/characters", (req, res)=>{
        db.query("SELECT * FROM characters", (err, results)=>{
            if(err){
                console.log(err);
            }else{
                res.send(result);
            }
        });
    });

    app.put("/update", (req, res)=>{
        const id = req.body.id;
        const deity = req.body.deity;
        db.query(
            "UPDATE characters SET deity = ? WHERE id = ?",
            [deity, id],
            (err, result)=>{
                if(err){
                    console.log(err);
                }else {
                    res.send(result);
                }
            }
        );
    });

    app.delete("/delete/:id", (req, res) => {
        const id = req.params.id;
        db.query("DELETE FROM characters WHERE id = ?", id, (err, result)=>{
            if (err){
                console.log(err);
            }else {
                res.send(result);
            }
        });
    });


app.listen(3001, ()=>{
    console.log("Server is running on 3001");
});

