const mongoose = require("mongoose");

const venteSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    produits: [
      {
        produitId: { type: mongoose.Schema.Types.ObjectId, required: true },
        nom: { type: String, required: true },
        type: { type: String, enum: ["base", "bargataire"], required: true },
        quantiteKg: { type: Number, required: true },
      },
    ],
    prixParType: [
      {
        type: { type: String, enum: ["base", "bargataire"], required: true },
        totalKg: { type: Number, required: true },
        prixKg: { type: Number, required: true },
        sousTotal: { type: Number, required: true },
      },
    ],
    totalGeneral: { type: Number, required: true },
    chauffeur: { type: String, required: true },
    matriculation: { type: String, required: true },
    source: {
      type: String,
      enum: ["production", "service"],
      required: true,
    },
    dateVente: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vente", venteSchema);
