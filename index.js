require("dotenv").config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const user = require("./model/user");
const cors = require("cors");
const User = require("./model/user");
const connectDatabase = require("./config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");

// connect to database
connectDatabase();

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.post("/register", async (req, res) => {
  // TODO:
  // get all information
  // check mandatory fields
  // already registered
  // take care of password
  // generate token or send success message

  try {
    const { firstname, lastname, email, password } = req.body;

    if (!(email && password && firstname && lastname)) {
      return res.status(400).send("All fields are required");
    }

    let existingUser = await User.findOne({ email: email.toLowerCase() }); // PROMISE
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    let encPassword = await bcrypt.hash(password, 10);

    let user = await User.create({
      firstname,
      lastname,
      email: email.toLowerCase(),
      password: encPassword,
    });

    const token = jwt.sign(
      { user_id: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "2h" }
    );
    user.token = token;

    user.password = undefined;
    res.status(201).send(user);
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  // TODO:
  // get all information
  // check mandatory fields
  // get user from database
  // compare and verify password
  // give token and other information to user

  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).send("All fields are required");
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).send("user with email not registered");
    }

    let isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).send("Password is invalid");
    }

    const token = jwt.sign(
      {
        user_id: user._id,
        email: user.email,
      },
      process.env.SECRET_KEY,
      { expiresIn: "2h" }
    );

    user.token = token;

    // by using cookie
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    user.password = undefined;
    res
      .status(200)
      .cookie("token", token, options)
      .json({ success: true, user, token });
  } catch (error) {
    console.log(error);
  }
});

// TODO:
// use middleware
// check for token presence
// verify the token
// extract info from payload
// next()

app.get("/dashboard", auth, (req, res) => {
  res.send("Welcome to dashboard");
});

app.get("/logout", auth, (req, res) => {
  res.clearCookie("token");
  res.send("Logged out successfully");
});
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
