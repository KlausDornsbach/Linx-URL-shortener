const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

//var firebase = require("firebase/app");

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
var firestore = firebase.firestore();

const docRef = firestore.doc("samples/sandwichData");
const outputHeader = document.querySelector("#hotDogOutput");
const inputTextField = document.querySelector("#latestHotDogStatus");
const saveButton = document.querySelector("#saveButton");

saveButton.addEventListener("click", function() {
    const textToSave = inputTextField.value;
    console.log("I am gonna save" + textToSave + "to Firestore");
    docRef.set({
        hotDogStatus: textToSave
    }).then(function() {
        console.log("status saved!");
    }).catch(function (error) {
        console.log("Got an error: ", error);
    });
})



let map_users = new Map();  // only used to check existence of user in O(1)

const app = express();

app.use(bodyParser.json());

app.post("/users", (req, res) => {
    const { id } = req.body;
    if (map_users.has(id)) {
        res.sendStatus(409);
    } else {
        map_users[id] = id;  // only used to check existence of user in O(1)
    }
    res.sendStatus(201);
});

app.listen(5000, () => {
    console.log(`Server is running on port 5000.`);
});
