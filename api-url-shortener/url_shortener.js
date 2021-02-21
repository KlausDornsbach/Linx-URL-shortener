
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const firebase = require("firebase");
const shortid = require("shortid");
//const validUrl = require("valid-url");

var baseUrl = "http://localhost";
var port = 5000;

// The database //
var firebaseConfig = {
    apiKey: "AIzaSyAk1lbZR4Wk49Hk2PX8ayGTMNoaH4prpRE",
    authDomain: "linx-url-shortener.firebaseapp.com",
    projectId: "linx-url-shortener",
    storageBucket: "linx-url-shortener.appspot.com",
    messagingSenderId: "333461726133",
    appId: "1:333461726133:web:f804b59e6c227c00e82ffc",
    measurementId: "G-L6017LFJY3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);  
const db = firebase.firestore();


// The app //
const app = express();

// help express deal with post
app.use(bodyParser.json());


// main page
app.get("/", (req, res) => {
    console.log("page hit");
    res.sendFile(path.join(__dirname, "index.html"));
})

// GET /urls/:id
// function: redirect user to url using urlId
app.get("/urls/:id", (req, res) => {
    const { id } = req.params;
    if (urls.has(id)) {
        res.redirect(301, urls[id].url);
    } else {
        res.sendStatus(404);
    }
})

// POST /users/:userid/urls
// function: store url
app.post("/users/:userId/urls", async (req, res) => {
    console.log("call to this");
    const { url } = req.body;
    console.log(`url: ${ url }`);
    const userId = req.params.userId;
    console.log(`user: ${ userId }`);
    
    let code = shortid(url);
    console.log(`shortid: ${ code }`);
    let shortUrl = baseUrl + ":" + port + "/" + code;
    console.log(`shortUrl: ${shortUrl}`);
    var urlRef = await db.doc(`users/${userId}/urls`).get(shortUrl).catch(err=>alert(err));
    console.log(`shortUrl: ${urlRef}`);
    if(urlRef.exists) {
        console.log("exists");
        res.sendStatus(409);
    } else {
        var newUrl = urlRef.push();    // used to create new ID for url 
        newUrl.set({
            "hits": 0,
            "url": url,
            "shortUrl": shortUrl
        });
        console.log(`newUrl: ` + newUrl);
        res.status(201).send(newUrl);
    }
})

// POST /users
// function: store user
app.post("/users", async (req, res) => {
    //console.log("print");
    const { id } = req.body;
    const user = {
        id: id,
    }
    var userRef = await db.collection("users").doc(id).get(); // query to firebase
    if (userRef.exists) {   // if exists, sends error
        console.log("exists");
        res.sendStatus(409);
    } else {
        userRef = await db.collection("users").doc(id).set(user);
        console.log(JSON.stringify(userRef));
        res.status(201).send({
            id : id 
        });
    }
});

// DELETE /users/:userId
// function: delete user
app.delete("/users/:userId", async (req, res) => {
    let userId = req.params.userId;  // this is how you access route parameters
    console.log(userId);
    var userRef = await db.collection("users").doc(userId).get().catch(err=>alert(err));
    if (userRef.exists) {
        const userRef = await db.collection("users").doc(userId).delete();
        res.status(200).send({});
    } else {
        res.sendStatus(404);  // user not found 
    }
})


// port 5000
app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});

// The shorting method