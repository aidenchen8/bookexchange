const express = require('express')
const bodyParser = require("body-parser")
const mongoClient = require('mongodb').MongoClient;
const objectId = require("mongodb").ObjectId;

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.all('*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,XFILENAME,XFILECATEGORY,XFILESIZE");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  next();
});

const port = 9091

const dbName = "bookexchange";
const userCollection = "user";
const bookCollection = "book";
const chatCollection = "chat";


const STATUS_AVAILABLE = "available";
const STATUS_LOCK = "lock";
const STATUS_EXCHANGE = "exchange";
const STATUS_SOLD = "sold";

const mongoUrl = `mongodb://localhost:27017/${dbName}`
mongoClient.connect(mongoUrl, (err, db) => {
  if (err) {
    throw err;
  }
  console.log("mongodb connected.")
  db.close();
})


// controller
app.get('/api/version', (req, res) => {
  res.send('Book exchange 1.0.0')
});


// register
app.post("/api/register", (request, response) => {
  const user = {
    email: request.body["email"],
    name: request.body["name"],
    password: request.body["password"]
  }

  mongoClient.connect(mongoUrl, (err, db) => {
    if (err) {
      throw err;
    }

    let dbo = db.db(dbName);
    dbo.collection(userCollection).find({ email: user.email }).toArray((err, result) => {
      if (err) {
        throw err;
      }
      if (result.length > 0) {
        response.status = 500;
        response.send("user already exist");
        console.log("user already exist. ", user);
      } else {
        dbo.collection(userCollection).insertOne(user, (err, result) => {
          if (err) {
            throw err;
          }
          console.log("insert user done. ", user);
          db.close();
          response.send("ok")
        })
      }
    })
  })
});

// login
app.get("/api/login", (request, response) => {
  const user = {
    email: request.query["email"],
    name: request.query["name"],
    password: request.query["password"]
  }

  mongoClient.connect(mongoUrl, (err, db) => {
    if (err) {
      throw err;
    }

    let dbo = db.db(dbName);
    dbo.collection(userCollection).find(user).toArray((err, result) => {
      if (err) {
        throw err;
      }
      if (result.length > 0) {
        response.send("ok");
        console.log("user login. ", user);
      } else {
        response.send("user or password error");
        console.log("user or password error", user);
      }
    });
  });
});

// get user info
app.get("/api/user", (request, response) => {
  const email = request.query["email"]

  mongoClient.connect(mongoUrl, (err, db) => {
    if (err) {
      throw err;
    }

    let dbo = db.db(dbName);
    dbo.collection(userCollection).find({ email: email }).toArray((err, result) => {
      if (err) {
        throw err;
      }
      if (result.length > 0) {
        response.send(JSON.stringify(result));
        console.log("get user. ", result);
      } else {
        response.send("no user found " + email);
        console.log("no user. ", email);
      }
    });
  });
});

// publish book
app.post("/api/publish", (request, response) => {
  const book = {
    title: request.body["title"],
    description: request.body["description"],
    category: request.body["category"],
    seller: request.body["seller"], // email
    price: request.body["price"],
    author: request.body["author"],
    status: STATUS_AVAILABLE,
    buyer: null,
    publishTime: new Date(),
    soldTime: null
  };
  mongoClient.connect(mongoUrl, (err, db) => {
    if (err) {
      throw err;
    }
    let dbo = db.db(dbName);
    dbo.collection(bookCollection).find({ seller: book.seller, title: book.title }).toArray((err, result) => {
      if (err) {
        throw err;
      }
      if (result.length > 0) {
        response.status = 500;
        response.send("book already exist, " + JSON.stringify(book));
        console.log("book already exist. ", book);
      } else {
        dbo.collection(bookCollection).insertOne(book, (err, result) => {
          if (err) {
            throw err;
          }
          console.log("publish book done. ", book);
          db.close();
          response.send("ok")
        })
      }
    })
  })
});

// list book
app.get("/api/list/all", (request, response) => {
  mongoClient.connect(mongoUrl, (err, db) => {
    if (err) {
      throw err;
    }
    let dbo = db.db(dbName);
    dbo.collection(bookCollection).find({}).toArray((err, result) => {
      if (err) {
        throw err;
      }
      response.send(JSON.stringify(result))
    });
  });
});

// lock book
app.get("/api/lock", (request, response) => {
  const buyer = request.query["buyer"];
  const bookId = request.query["book"];

  mongoClient.connect(mongoUrl, (err, db) => {
    if (err) {
      throw err;
    }
    let dbo = db.db(dbName);
    dbo.collection(bookCollection).updateOne({ "_id": objectId(bookId) }, { $set: { "status": STATUS_LOCK, "buyer": buyer } }, (err, result) => {
      if (err) {
        throw err;
      }
      console.log("lock book", bookId, buyer);
      db.close();
      response.send("ok");
    });
  });
});

// list book, seller are me
app.get("/api/list/mine", (request, response) => {
  const seller = request.query["seller"];

  mongoClient.connect(mongoUrl, (err, db) => {
    if (err) {
      throw err;
    }
    let dbo = db.db(dbName);
    dbo.collection(bookCollection).find({ "seller": seller }).toArray((err, result) => {
      response.send(JSON.stringify(result));
    });
  });
});

app.get("/api/list/buy", (request, response) => {
  const buyer = request.query["buyer"];

  mongoClient.connect(mongoUrl, (err, db) => {
    if (err) {
      throw err;
    }
    let dbo = db.db(dbName);
    dbo.collection(bookCollection).find({ "buyer": buyer }).toArray((err, result) => {
      response.send(JSON.stringify(result));
    });
  });
});

// exchange book
app.get("/api/exchange", (request, response) => {
  const bookId = request.query["book"];

  mongoClient.connect(mongoUrl, (err, db) => {
    if (err) {
      throw err;
    }
    let dbo = db.db(dbName);
    dbo.collection(bookCollection).updateOne({ "_id": objectId(bookId) }, { $set: { "status": STATUS_EXCHANGE } }, (err, result) => {
      if (err) {
        throw err;
      }
      console.log("exchange book", bookId);
      db.close();
      response.send("ok");
    });
  });
});

// exchange book
app.get("/api/delete", (request, response) => {
  const bookId = request.query["book"];

  mongoClient.connect(mongoUrl, (err, db) => {
    if (err) {
      throw err;
    }
    let dbo = db.db(dbName);
    dbo.collection(bookCollection).deleteOne({ "_id": objectId(bookId) }, (err, result) => {
      if (err) {
        throw err;
      }
      console.log("delete book", bookId);
      db.close();
      response.send("ok");
    });
  });
});

// cancel book
app.get("/api/cancel", (request, response) => {
  const bookId = request.query["book"];

  mongoClient.connect(mongoUrl, (err, db) => {
    if (err) {
      throw err;
    }
    let dbo = db.db(dbName);
    dbo.collection(bookCollection).updateOne({ "_id": objectId(bookId) }, { $set: { "status": STATUS_AVAILABLE, "buyer": null, "soldTime": null } }, (err, result) => {
      if (err) {
        throw err;
      }
      console.log("cancel book", bookId);
      db.close();
      response.send("ok");
    });
  });
});


// sold book
app.get("/api/sold", (request, response) => {
  const bookId = request.query["book"];

  mongoClient.connect(mongoUrl, (err, db) => {
    if (err) {
      throw err;
    }
    let dbo = db.db(dbName);
    dbo.collection(bookCollection).updateOne({ "_id": objectId(bookId) }, { $set: { "status": STATUS_SOLD, "soldTime": new Date() } }, (err, result) => {
      if (err) {
        throw err;
      }
      console.log("sold book", bookId);
      db.close();
      response.send("ok");
    });
  });
});


// review book
app.post("/api/review", (request, response) => {
  const bookId = request.body["book"];
  const review = request.body["review"];

  mongoClient.connect(mongoUrl, (err, db) => {
    if (err) {
      throw err;
    }
    let dbo = db.db(dbName);
    dbo.collection(bookCollection).updateOne({ "_id": objectId(bookId) }, { $set: { "review": review } }, (err, result) => {
      if (err) {
        throw err;
      }
      console.log("review book", request.body);
      db.close();
      response.send("ok");
    });
  });
});

// send message
app.post("/api/chat/send", (request, response) => {
  const from = request.body["from"];
  const message = request.body["message"];
  const to = request.body["to"];

  const msg = {

    from: from,
    message: message,
    time: new Date(),
    to: to

  }

  mongoClient.connect(mongoUrl, (err, db) => {
    if (err) {
      throw err;
    }
    let dbo = db.db(dbName);
    dbo.collection(chatCollection).insertOne(msg, (err, result) => {
      if (err) {
        throw err;
      }
      console.log("send message", request.body);
      db.close();
      response.send("ok");
    });
  });
});

app.get("/api/chat/receive", (request, response) => {
  const from = request.query["from"];
  const to = request.query["to"];

  mongoClient.connect(mongoUrl, (err, db) => {
    if (err) {
      throw err;
    }
    let dbo = db.db(dbName);
    dbo.collection(chatCollection).find(
      {
        $or: [
          {
            "from": from,
            "to": to
          },
          {
            "from": to,
            "to": from
          }
        ]
      }
    ).toArray((err, result) => {
      response.send(JSON.stringify(result));
    });
  });
});




app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});