
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const firebase = require("firebase");
const shortid = require("shortid");
const FieldValue = require('firebase-admin').firestore.FieldValue;
const increment = firebase.firestore.FieldValue.increment(1);
//const validUrl = require("valid-url");

//var baseUrl = "http://localhost";
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


// GET /stats
// return global stats (total hits, url count, topUrls)



// GET /users/:id/stats
// return user stats
app.get("/users/:userId/stats", async (req, res) => {
    const { userId } = req.params;
    if (await db.collection("users").doc(userId).empty) {
        res.sendStatus(404);
        return;
    }
    const queryUrls = await db.collection("users").doc(userId).collection("urls").get();
    let out = {
        "hits": 0,
        "urlCount": 0,
        "topUrls":[],
        "urls":[]
    }
    if (!queryUrls.empty) {
        queryUrls.forEach(async doc => {
            const hits = await db.collection("users").doc(doc.data().user).collection("urls").
                                    doc(doc.id).collection("stories").doc("--stats--").get();
            let url = doc.data();
            if (!hits.empty) {
                const docHitCount = hits.data().hitCount // grab hit count
                if (!url.hits == docHitCount) { // is "hits" it up to date?
                    url.hits = docHitCount; // update hit count
                    await db.collection("users").doc(doc.data().user).collection("urls").
                                        doc(doc.id).set(url);
                }
            }
            delete url.user;
            out.urlCount = out.urlCount + 1;
            out.hits = out.hits + url.hits;
            out.urls.push(url);
            console.log(out);
        })
        res.send(out);
    }
})





//                             |
// FULLY IMPLEMENTED FUNCTIONS v

// GET /:code
// uses short url to return real url
app.get("/:code", async (req, res) => {
    const { code } = req.params;
    let urlsQuery = await db.collectionGroup("urls").where("shortUrl", "==", code). // check existence
                                    get().catch(err=>console.error(err));
    if (!urlsQuery.empty) {
        res.redirect(301, urlsQuery.docs[0].data().url);
    } else {
        res.sendStatus(404);
    }
})

//GET /stats/:id
//return url stats
app.get("/stats/:id", async (req, res) => {
    const { id } = req.params;
    let urlsQuery = await db.collectionGroup("urls").where("id", "==", id). // check existence
                                    get().catch(err=>console.error(err));
    if (!urlsQuery.empty) {
        let urlStats = urlsQuery.docs[0].data();
        jsonStats = {
            hits: urlStats.hits,
            id: urlStats.id,
            shortUrl: urlStats.shortUrl,
            url: urlStats.url,
            user: urlStats.user
        }
        urlStats.id = urlsQuery.docs[0].id;
        let realHits = await db.collection("users").doc(urlStats.user).collection("urls").doc(id). // check existence
                                    collection("stories").doc("--stats--").get();
        
        jsonStats.hits = realHits.data().hitCount;
        await db.collection("users").doc(urlStats.user).collection("urls").
                                    doc(urlStats.hits).set({jsonStats}).catch(err=>console.error(err));
        res.send(jsonStats);
    } else {
        res.sendStatus(404);
    }
})


// GET /urls/:id
// function: redirect user to url using urlId
app.get("/urls/:id", async (req, res) => {
    const { id } = req.params;
    let urlsQuery = await db.collectionGroup("urls").where("id", "==", id). // check existence
                                    get().catch(err=>console.error(err));
    if (!urlsQuery.empty) {
        let userId = urlsQuery.docs[0].data().user;
        urlRef = db.collection("users").doc(userId).collection("urls").doc(id);
        
        // method to count hits
        const urlStatsRef = urlRef.collection("stories").doc("--stats--");
        const storyRef = urlRef.collection("stories").doc(`${Math.random()}`);

        const batch = db.batch();
        batch.set(storyRef, { title: "new hit" });
        batch.set(urlStatsRef, { hitCount: increment}, {merge: true});
        batch.commit();
        
        res.redirect(301, urlsQuery.docs[0].data().url);
    } else {
        res.sendStatus(404);
    }
})

// DELETE /urls/:id
// deletes url of id: id
app.delete("/urls/:id", async (req, res) => {
    const { id } = req.params;
    let urlsQuery = await db.collectionGroup("urls").where("id", "==", id). // check existence
                                    get().catch(err=>console.error(err));
    if(!urlsQuery.empty) {
        urlsQuery.forEach(async (doc) => {
            let key = doc.id;
            let userId = doc.data().user;
            await db.collection("users").doc(userId).collection("urls"). // deleting
                                    doc(key).delete().catch(err=>console.error(err));  
        })
        res.send({});
    } else {
        res.sendStatus(404);
    }
})

// POST /users/:userid/urls
// function: store url
app.post("/users/:userId/urls", async (req, res) => {
    const { url } = req.body;
    const userId = req.params.userId;

    let usersRef = db.collection("users"); 
    let urlsRef = usersRef.doc(userId).collection("urls");
    let urlsRefQuery = await urlsRef.where("url", "==", url).get(); // check if exists
    //console.log(urlsRefQuery.empty);

    let code = shortid(url);
    let shortUrl = "http://<host>[:<port>]/" + code;

    if(!urlsRefQuery.empty) {
        console.log("exists");  
        res.sendStatus(409);
    } else {
        let newUrl = {
            "hits": 0,
            "url": url,
            "shortUrl": code,
            "user": userId
        }
        const dbResponse = await db.collection("users").doc(userId).  // create new url
                                collection("urls").add(newUrl).catch(err=>console.error(err));    
        
        newUrl.id = dbResponse.id;
        
        await db.collection("users").doc(userId).collection("urls").doc(dbResponse.id).
                                set( newUrl ).catch(err=>console.error(err));   
        // necessary query to send id sad unoptimized noises :c
                
        delete newUrl.user;
        newUrl.shortUrl = shortUrl;
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
    let userRef = await db.collection("users").doc(id).get(); // check if exists
    if (userRef.exists) {   // if exists, sends error
        console.log("exists");
        res.sendStatus(409);
    } else {
        userRef = await db.collection("users").doc(id).set(user); // send data
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
    let userRef = await db.collection("users").doc(userId).get().catch(err=>alert(err));// check
    if (userRef.exists) {                                                               // exists
        await db.collection("users").doc(userId).delete(); // delete
        res.status(200).send({});
    } else {
        res.sendStatus(404);  // user not found 
    }
})


// port 5000
app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});


// in firebase, you can update a document about once per second, to overcome this 
// i used this implement of distributed counter (shard counter)

function incrementCounter(docRef, numShards) {
    const shardId = Math.floor(Math.random() * numShards);
    const shardRef = docRef.collection('shards').doc(shardId.toString());
    return shardRef.set({count: FieldValue.increment(1)}, {merge: true});
}

async function getCount(docRef) {
    const querySnapshot = await docRef.collection('shards').get();
    const documents = querySnapshot.docs;
  
    let count = 0;
    for (const doc of documents) {
      count += doc.get('count');
    }
    return count;
}