const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  referance: String,
  poids: String,
  nombre: String,
});

module.exports = articleSchema;
