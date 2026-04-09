const mongoose = require("mongoose");
const articleSchema = require("./Article");
const blSchema = new mongoose.Schema({
  ref: { type: String, unique: true },
  codeClient: String,
  articleScan: [articleSchema],
  dateChauffeur: Date,
  etatChauffeur: { type: String, enum: ["Bon", "Mal"] },
  dateDepot: Date,
  dateLivreur: Date,
  etatDepot: { type: String, enum: ["Bon", "Mal"] },
  etatLivreur: { type: String, enum: ["Bon", "Mal"] },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  
});

module.exports = mongoose.model("BL", blSchema);
