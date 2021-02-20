const tls = require("tls");
const fs = require("fs")
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

let users = new Map();
let urls = new Map();

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
app.post("/users/:userid/urls", (req, res) => {
    const { ulr_name } = req.body;
    const { userId } = req.params;

})

// POST /users
// function: store user
app.post("/users", (req, res) => {
    //console.log("print");
    const { id } = req.body;
    if (users.has(id)) {
        res.sendStatus(409);
        return;
    } else {
        users.set(id, {});  // only used to check existence of user in O(1)
    }
    res.status(201).send({
        id : id 
    });
});



const options = {
  // Necessary only if the server uses a self-signed certificate.
  ca: [ fs.readFileSync('klaus-cert.pem') ],

  // Necessary only if the server's cert isn't for "localhost".
  checkServerIdentity: () => { return null; },
};

const socket = tls.connect(5000, options, () => {
  console.log('client connected',
              socket.authorized ? 'authorized' : 'unauthorized');
  process.stdin.pipe(socket);
  process.stdin.resume();
});
socket.setEncoding('utf8');
socket.on('data', (data) => {
  console.log(data);
});
socket.on('end', () => {
  console.log('server ends connection');
});

// port 5000
app.listen(5000, () => {
    console.log(`Server is running on port 5000.`);
});
