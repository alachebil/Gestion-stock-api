const mongoose = require("mongoose");

const livraisonSchema = new mongoose.Schema({
  dateLivraisonClient: Date,
  etatLivraison: { type: String, enum: ["Bon", "Mal"] },
  confirmation: String,
  blId: { type: mongoose.Schema.Types.ObjectId, ref: "BL" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Livraison", livraisonSchema);
