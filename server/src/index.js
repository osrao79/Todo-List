const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const session = require("express-session");

const session_secret = "shhh";

const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use(
  session({
    secret: session_secret,
    cookie: { maxAge: 1 * 60 * 60 * 1000 },
  })
);

//connect
const db = mongoose.createConnection("mongodb://localhost:27017/TodoDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Scheama(s)
const userScheama = new mongoose.Schema({
  userName: String,
  password: String,
});
const TodoScheama = new mongoose.Schema({
  task: String,
  done: Boolean,
  creationTime: Date,
  userId: mongoose.Schema.Types.ObjectId,
});

//Models
const userModel = db.model("user", userScheama);
const todoModel = db.model("todo", TodoScheama);

//backend APIs
//Signup API
isNullorUndefined = (val) => val === null || val === undefined;
const SALT = 5;

app.post("/signup", async (req, res) => {
  const { userName, password } = req.body;
  const existingUser = await userModel.findOne({ userName });
  if (isNullorUndefined(existingUser)) {
    // allow Signup
    const hashedPass = bcrypt.hashSync(password, SALT);
    const newUser = new userModel({ userName, password: hashedPass });
    await newUser.save();
    //add userId in session to secure
    req.session.userId = newUser._id;
    res.status(201).send({ success: "Signed up Successfully" });
  } else {
    res.status(400).send({ err: `UserName ${userName} already exist` });
  }
});
// Login API
app.post("/login", async (req, res) => {
  const { userName, password } = req.body;
  // const hashedPass = bcrypt.hashSync(password, SALT);
  const existingUser = await userModel.findOne({
    userName: userName,
    // password: hashedPass,
  });
  if (isNullorUndefined(existingUser)) {
    res.status(401).send({ err: "Username/Password Incorrect" });
  } else {
    const hashedPass = existingUser.password;
    if (bcrypt.compareSync(password, hashedPass)) {
      req.session.userId = existingUser._id;

      res.status(200).send({ success: "Logged in" });
    } else {
      res.status(401).send({ err: "Username/Password Incorrect" });
    }
  }
});
//Logout
app.get("/logout", (req, res) => {
  if (!isNullorUndefined(req.session)) {
    req.session.destroy(() => {
      res.sendStatus(200);
    });
  } else {
    res.sendStatus(200);
  }
});

//Auth Middleware
// const AuthMiddleware = async (req, res, next) => {
//   const userName = req.headers["x-username"];
//   const password = req.headers["x-password"];

//   if (isNullorUndefined(userName) || isNullorUndefined(password)) {
//     res.status(401).send({ err: "Username/Password Incorrect" });
//   } else {
//     const existingUser = await userModel.findOne({
//       userName: userName,
//     });

//     if (isNullorUndefined(existingUser)) {
//       res.status(401).send({ err: "Username/Password Incorrect" });
//     } else {
//       const hashedPass = bcrypt.hashSync(password, SALT);
//       if (bcrypt.compareSync(password, hashedPass)) {
//         req.user = existingUser;
//         next();
//       } else {
//         res.status(401).send({ err: "Password Incorrect" });
//       }
//     }
//   }
// };

//using session in auth middleware to reduce code
const AuthMiddleware = async (req, res, next) => {
  if (isNullorUndefined(req.session) || isNullorUndefined(req.session.userId)) {
    res.status(401).send({ err: "Not logged in" });
  } else {
    next();
  }
};
// UserInfo Endpoint (for the browser to find if user is logged in or not)
app.get("/userinfo", AuthMiddleware, async (req, res) => {
  const user = await userModel.findById(req.session.userId);
  res.send({ userName: user.userName });
});

//Todo API
//Read all todo on db
app.get("/todo", AuthMiddleware, async (req, res) => {
  // const userId = req.user._id;
  // console.log(userId);
  const allTodos = await todoModel.find({ userId: req.session.userId });
  res.send(allTodos);
});

//post new todo
app.post("/todo", AuthMiddleware, async (req, res) => {
  const todo = req.body;
  todo.creationTime = new Date();
  todo.done = false;
  todo.userId = req.session.userId;
  const newTodo = new todoModel(todo);
  await newTodo.save();
  res.status(201).send(newTodo);
});
//update a todo
app.put("/todo/:todoid", AuthMiddleware, async (req, res) => {
  const { task } = req.body;
  const todoid = req.params.todoid;
  try {
    const todo = await todoModel.findOne({
      _id: todoid,
      userId: req.session.userId,
    });
    if (isNullorUndefined(todo)) {
      res.sendStatus(404);
    } else {
      todo.task = task;
      await todo.save();
      res.send(todo);
    }
  } catch (e) {
    res.sendStatus(404);
  }
});
//delete a todo
app.delete("/todo/:todoid", AuthMiddleware, async (req, res) => {
  const todoid = req.params.todoid;
  try {
    await todoModel.deleteOne({ _id: todoid, userId: req.session.userId });
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(404);
  }
});

const PORT = 9999;
app.listen(PORT, () => {
  console.log(`Server is Running on ${PORT}`);
});
