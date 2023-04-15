function api() {
    const cors=require("cors");
    const express = require('express');
    const mysql = require('mysql');
    const corsOptions ={
    origin:'*', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
    }
    const app = express()
    app.use(cors(corsOptions)) // Use this after the variable declaration
    app.use(express.json());
    app.listen(7777, '0.0.0.0', ()=>{
        console.log("API ON sur le Port : 7777")
    })

    const db = mysql.createConnection({host: "db4free.net", user: "dbangular", password:"Azerty123*", database: "dbangular"})
    db.connect(function(err) {   
        if (err){
            console.log(err)
        }
    });

    function getRandomByFamille(idfamille, callback) {
        db.query(`SELECT * FROM mot WHERE id_famille = ${idfamille}`, callback);
    }

    function getRandomFamille(callback) {
        db.query(`SELECT * FROM famille_mot ORDER BY RAND() LIMIT 1`, callback);
    }

    app.get('/word', (req,res) => {
        let wordlist = [];
        getRandomFamille((error, results) => {
            if (error) console.error(error); // Gérer l'erreur
            getRandomByFamille(results[0].id,(error, results) => {
            if (error) console.error(error); // Gérer l'erreur
                let index1 = Math.floor(Math.random() * results.length);
                let index2 = Math.floor(Math.random() * results.length);
                while(index2 == index1){
                    index2 = Math.floor(Math.random() * results.length);
                }
                wordlist.push(results[index1].mot);
                wordlist.push(results[index2].mot);
                res.status(200).json(wordlist);
              });
            });
    })
}

module.exports = api;