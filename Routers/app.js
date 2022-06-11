const express = require("express");
const app = express.Router();

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const body_parser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");

// const port = process.env.PORT || 4000;

//schemas
const Item = require("../Schemas/itemSchema");
const User = require("../Schemas/userSchema");


//middlewares
app.use(body_parser.json());
app.use(cors());
app.use(express.json());

//mail sent


//router-cart
app.get("/cart", async (req, res) => {
    const data = await Item.find();
    res.send(data);
  });
  
  app.post("/cart", async (req, res) => {
    const { username, image, title, price } = req.body;
  
    console.log(req.body);
    const item = await Item({ username, image, title, price });
    item.save();
  
    res.json({ message: "ITEM ADDED SUCCESSFULLY" });
  });
  
  app.delete("/cart/:id", async (req, res) => {
    console.log(req.body);
    const _id = req.params.id;
  
    console.log(_id);
    const result = await Item.deleteOne({ _id: _id });
    console.log(result);
  
    res.send("DELETED SUCCESSFULLY");
  });
  
  //user authentication
  app.post("/", async (req, res) => {
    //console.log(req.body);
    const { username, email, password } = req.body;
  
    try {
      const userExist = await User.findOne({ email: email });
      if (userExist) {
        return res.status(422).json({ error: "USER ALREADY REGISTERED" });
      }
  
      const user = new User({ username, email, password });
  
      const userRegister = await user.save();
      if (userRegister) {
        res.status(201).json({ message: "USER REGISTERED SUCCESSFULLY" });
      }
    } catch (err) {
      console.log(err);
    }
  });
  
  app.post("/signin", async (req, res) => {
    const { username, password } = req.body;
  
    //console.log(username);
    try {
      const userLogin = await User.findOne({ email: username });
  
      if (userLogin) {
        const isMatch = await bcrypt.compare(password, userLogin.password);
        //const token = await userLogin.generateToken();
        //console.log(token);
  
        if (!isMatch) {
          res.status(400).json({ error: "INVALID CREDENTIALS" });
        } else {
          //console.log("hlo")
          //res.cookie('user', username);
          res.json({ message: "login successfully" });
        }
      } else {
        res.status(400).json({ error: "INVALID CREDENTIALS" });
      }
    } catch (err) {
      //console.log(err);
    }
  });

  module.exports = app