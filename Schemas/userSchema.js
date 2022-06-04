const mongoose = require("mongoose");
const schema = mongoose.Schema;
const bcrypt = require('bcryptjs')

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

  module.exports = User;