const mongoose = require("mongoose");

const matierePremiereSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    type: {
      type: String,
      enum: ["Type 1", "Type 2", "Type 3"],
      required: true,
    },
    quantiteKg: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MatierePremiere", matierePremiereSchema);
