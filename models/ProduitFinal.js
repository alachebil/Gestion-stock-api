const mongoose = require("mongoose");

const produitFinalSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    quantiteKg: { type: Number, required: true, default: 0 },
    produitSemiPretSource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProduitSemiPret",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProduitFinal", produitFinalSchema);
