const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
//const firebase = require("firebase");
/*
var firebaseConfig = {
    apiKey: "AIzaSyAk1lbZR4Wk49Hk2PX8ayGTMNoaH4prpRE",
    authDomain: "linx-url-shortener.firebaseapp.com",
    projectId: "linx-url-shortener",
    storageBucket: "linx-url-shortener.appspot.com",
    messagingSenderId: "333461726133",
    appId: "1:333461726133:web:f804b59e6c227c00e82ffc",
    measurementId: "G-L6017LFJY3"
};
*/
// Initialize Firebase
//firebase.initializeApp(firebaseConfig);  
//var firestore = firebase.firestore();

//const docRef = firestore.doc("samples/sandwichData");

//<script src="https://www.gstatic.com/firebasejs/8.2.8/firebase-app.js"></script>
//<script src="https://www.gstatic.com/firebasejs/8.2.8/firebase-firestore.js"></script>

let map_users = new Map();

const app = express();

// help express deal with post
app.use(bodyParser.json());

// main page
app.get("/", (req, res) => {
    console.log("page hit");
    res.sendFile(path.join(__dirname, "index.html"));
})

// POST /users
// function: store user
app.post("/users", (req, res) => {
    //console.log("print");
    const { id } = req.body;
    if (map_users.has(id)) {
        res.sendStatus(409);
        return;
    } else {
        map_users.set(id, true);  // only used to check existence of user in O(1)
    }
    res.status(201).send({
        id : id 
    });
});



// port 5000
app.listen(5000, () => {
    console.log(`Server is running on port 5000.`);
});
