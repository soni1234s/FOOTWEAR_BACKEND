const mongoose = require("mongoose");
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
  
  module.exports =  mongoose.model("ORDER", itemSchema);