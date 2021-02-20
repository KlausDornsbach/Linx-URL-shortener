const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

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