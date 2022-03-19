const express = require("express");
const app = express();

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const port = process.env.PORT || 4000;

const body_parser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");

//routes
const router = require("./Routers/app")

//connect database
const mongoose = require("mongoose");

const db = process.env.DATABASE;
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connection successful!");
  })
  .catch((err) => {
    console.log(err);
  });
  
//middlewares
app.use(router);
app.use(body_parser.json());
app.use(cors());
app.use(express.json());


app.listen(port, (req, res) => {
  console.log(`server start at ${port}`);
});
