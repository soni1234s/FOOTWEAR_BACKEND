const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const body_parser = require("body-parser");
const cors = require("cors");
dotenv.config({ path: "./config.env" });
const bcrypt = require("bcryptjs");
const port = process.env.PORT || 4000;
var cookieParser = require('cookie-parser')

//middlewares
app.use(body_parser.json());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

//connect database
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

const schema = mongoose.Schema;

const itemSchema = new schema({
  username: {
    type: String,
    required: true
  },
  image: {
    type: String,
    trim: true,
    required: true,
  },
  title: {
    type: String,
    trim: true,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const Item = mongoose.model("ORDER", itemSchema);

const userSchema = new schema({
  username: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});


userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  next();
});
const User = mongoose.model("USER", userSchema);

var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    service: process.env.SMPT_SERVICE,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD
    },
});

//otp

app.post("/otp", (req, res) => {
  const { email, otp, adr, city, state, image, title, price, name } = req.body;

  var mailOptions;

  if(!adr && !city && !state && !image && !title && !price){
    mailOptions = {
      from: process.env.SMPT_MAIL,
      to: email,
      subject: "Otp For Verify Your Mail id..",
      text: `Hi ${name} , Your Otp is ${otp}`,
    };
  }else{
    mailOptions = {
      from: process.env.SMPT_MAIL,
        to: email,
      subject: 'YOUR ORDER WAS SUCCESSFULLY PLACED',
      html: `<div> <h1>YOUR ITEM</h1> <div><img src=${image} alt="..."/> <div> <h2>${title}</h2> <h3>₹ ${price}</h3> </div></div>  <ul> <li>city : ${city}</li> <li>state : ${state}</li> <li>address : ${adr}</li></ul></div>`
    }
  }


  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      res.status(200).json({ message: "OTP SENT SUCCESSFULLY!" });
      console.log("Email sent: " + info.response);
    }
  });
});

//validatorcookie

// function validatorCookie(req, res, next) {
//   const {cookies} = req;
//   if('user' in cookies){
//     if(cookies.user!==null)next();
//     else res.status(403).send({message: "USER NOT AUTHORIZED"});
//   }else{
//     res.status(403).send({message: "USER NOT AUTHORIZED"});
//   }
// }

//routes
app.get("/", (req, res) => {
  res.send("hello");
})
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

app.listen(port, (req, res) => {
  console.log(`server start at ${port}`);
});
