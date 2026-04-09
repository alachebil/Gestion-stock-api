const mongoose = require('mongoose');

const reclamationSchema = new mongoose.Schema({
  type: { type: String, enum: ["Etat", "Quantite"] },
  refArticle: String,
  poid: String,
  nombre: String,
  justification: String,
  etat: String,
  depottraite: {  type: String, enum: ["Oui", "Non"], default: "Non"  },
  usinetraite: {  type: String, enum: ["Oui", "Non"], default: "Non"  },
  blId: { type: mongoose.Schema.Types.ObjectId, ref: "BL" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Reclamation = mongoose.model('Reclamation', reclamationSchema);

module.exports = Reclamation;
