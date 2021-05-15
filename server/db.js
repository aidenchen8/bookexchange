const mongoClient = require('mongodb').MongoClient;
const objectId = require("mongodb").ObjectId;

mongoClient.connect("mongodb://localhost:27017/bookexchange", (err, db) => {
    if (err) {
        throw err;
    }
    let dbo = db.db("bookexchange");
    dbo.collection("user").find({}).toArray((err, result) => {
        if (err) {
            throw err;
        }
        console.log(result)
    });
});