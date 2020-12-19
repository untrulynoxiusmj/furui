const express = require("express");
const axios = require("axios");
const mongo = require("mongodb").MongoClient;
const cors = require("cors");
var bodyParser = require("body-parser");

const credentials = require("./credentials.js");

const url = "mongodb://localhost:27017";
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const clientId = credentials.clientId;
const clientSecret = credentials.clientSecret;

var db;

mongo.connect(
    url,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    (err, client) => {
        if (err) {
            console.error(err);
            return;
        }
        db = client.db("furui");
    }
);


app.get("/auth/github", (req, res) => {
    res.redirect(
        `https://github.com/login/oauth/authorize?client_id=${clientId}`
    );
});

let token = null;

app.get("/auth/github/callback", (req, res) => {
    const body = {
        client_id: clientId,
        client_secret: clientSecret,
        code: req.query.code,
    };
    const opts = { headers: { accept: "application/json" } };

    axios
        
        .post(`https://github.com/login/oauth/access_token`, body, opts)
        
        .then((res) => res.data["access_token"])
        
        .then((_token) => {
            token = _token;
            console.log("My token:", token);
            res.redirect(
                `http://localhost:5000/getToken?access_token=${token}`
            );
        })
        
        .catch((err) => res.status(500).json({ message: err.message }));
});

var userCheck = async function (req, res, next) {
    try {
        let token = req.headers.authorization.split(" ")[1];
        let result = await axios({
            method: "get",
            url: `https://api.github.com/user`,
            headers: {
                accept: "application/json",
                Authorization: `token ${token}`,
            },
        });
        req.user = result.data;
        next();
    } catch (error) {
        res.json({ success: false });
    }
};

app.use(userCheck);

app.get("/user", async (req, res) => {

    let userData;

    try {
        userData = req.user;
        console.log(userData)
        const name = userData.name;
        const users = db.collection("users");

        
        let update = await users
            .updateOne(
                { username: userData.login },
                { $set: userData },
                {
                    upsert: true,
                }
                
            )
            .then((cbValue) => {
                ;
            })
            .catch((err) => console.error(`Failed to update: ${err}`));

            userData.success = true;

    } catch (error) {
        userData = {
            success : false
        }
    }

    res.send(userData);
});

app.listen(3000);
console.log("App listening on port 3000");
