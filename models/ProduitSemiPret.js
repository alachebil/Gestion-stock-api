const mongoose = require("mongoose");

const produitSemiPretSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    type: {
      type: String,
      enum: ["base", "bargatere"],
      required: true,
    },
    quantiteKg: { type: Number, required: true, default: 0 },
    matiereSource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MatierePremiere",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProduitSemiPret", produitSemiPretSchema);
