const mongoose = require("mongoose");

const serviceFinalSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    type: {
      type: String,
      enum: ["base", "bargatere"],
      required: true,
    },
    quantiteKg: { type: Number, required: true, default: 0 },
    etat: {
      type: String,
      enum: ["dispo", "vendu"],
      default: "dispo",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceFinal", serviceFinalSchema);
