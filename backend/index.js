const express = require("express");
const axios = require("axios");
const mongo = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
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
        console.log(userData);
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
            .then((cbValue) => {})
            .catch((err) => console.error(`Failed to update: ${err}`));

        userData.success = true;
    } catch (error) {
        userData = {
            success: false,
        };
    }

    res.send(userData);
});

app.post("/code", async (req, res) => {
    try {
        let userData = req.user;

        let code = req.body.code;
        let title = req.body.title;
        let tags = req.body.tags;

        const codes = db.collection("codes");

        var newcode;
        if (code) {
            newcode = code.replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
                return "&#" + i.charCodeAt(0) + ";";
            });
        } else {
            newcode = "";
        }

        var withnl = "\n";
        withnl += newcode;

        let update = await codes
            .insertOne({
                username: userData.login,
                image: userData.avatar_url,
                code: withnl,
                title: title,
                tags: tags,
                likes: 0,
            })
            .then((returnValue) => {})
            .catch((err) => console.error(`Failed to insert: ${err}`));

        res.send({
            success: "true",
        });
    } catch (error) {
        console.log("pumpkin");
        res.send({
            success: "false",
        });
    }
});

app.get("/profile/:username", async (req, res) => {
    try {
        let username = req.params.username;
        const users = db.collection('users');
        let result = users.findOne({
            username: username
        })
        .then(cb => {
            if (cb!=null){
                cb.success = true;
                res.send(cb);
                return;
            }
            else{
                res.send({
                    success : false
                })
            }
            
        })
    } catch (error) {
        res.send({
            success : false
        })
    }
})

app.get("/code/:page", async (req, res) => {
    try {

        let page = parseInt(req.params.page);
        let tags = req.query.tags;

        console.log(page);

        let quer;

        if (tags == "" || tags == undefined) {
            quer = {};
        } else {
            let tagsSplit = tags.toString().split(" ");
            if (tagsSplit.length == 0) {
                quer = {};
            } else {
                quer = {
                    tags: { $all: tagsSplit },
                };
            }
        }

        let postCode = new Array();
        console.log("code get");

        let userData = req.user;

        const codes = db.collection("codes");
        const likes = db.collection("likes");

        let total = 0;
        codes.countDocuments().then((count) => {
            total = count;
        });

        if (page < 1) {
            page = 1;
        }
        let dnif = codes
            .find(quer)
            .sort({ _id: -1 })
            .limit(1)
            .skip(page - 1);
        dnif.forEach(async (cur) => {
            let liked = await likes
                .findOne({
                    username: userData.login,
                    codeId: cur._id.toString(),
                })
                .then((item) => {
                    if (item != null) {
                        cur.liked = true;
                    } else {
                        cur.liked = false;
                    }
                });
            cur.success = true;
            cur.total = total;
            res.send(cur);
            return;
        });
    } catch (error) {
        console.log("here")
        res.send({
            success: false,
        });
    }
});

app.post("/like", async (req, res) => {
    console.log("code like");
    let codeID = req.query.id;

    let userData = req.user;

    const codes = db.collection("codes");
    let likes = db.collection("likes");

    let match = {
        codeId: codeID,
        username: userData.login,
    };
    let like = true;
    let updateLike = await likes
        .updateOne(
            match,
            { $set: match },
            {
                upsert: true,
            }
        )
        .then(async (returnValue) => {
            if (returnValue.upsertedCount == 1) {
                let update = await codes
                    .updateOne(
                        {
                            _id: new ObjectID(codeID),
                        },
                        { $inc: { likes: 1 } }
                    )
                    .then((returnValue) => {})
                    .catch((err) => console.error(`Failed to insert: ${err}`));
            } else {
                like = false;
                let deleteC = await likes
                    .deleteOne(match)
                    .then((returnValue) => {})
                    .catch((err) => console.error(`Failed to insert: ${err}`));

                let update = await codes
                    .updateOne(
                        {
                            _id: new ObjectID(codeID),
                        },
                        { $inc: { likes: -1 } }
                    )
                    .then((returnValue) => {})
                    .catch((err) => console.error(`Failed to insert: ${err}`));
            }
        })
        .catch((err) => console.error(`Failed to insert: ${err}`));

    res.send({
         msg: "ok",
         like:like
    });
});

app.post("/comment", async (req, res) => {

    let userData = req.user;

    let id = req.body.id;
    let text = req.body.text;
    const codes = db.collection("codes");

    let update = await codes
        .updateOne(
            {
                _id: new ObjectID(id),
            },
            {
                $push: {
                    comments: {
                        username: userData.login,
                        comment: text,
                    },
                },
            }
        )
        .then((returnValue) => {
        })
        .catch((err) => console.error(`Failed to insert: ${err}`));

    res.send({
        msg: "ok"
    });
});

app.listen(3000);
console.log("App listening on port 3000");
