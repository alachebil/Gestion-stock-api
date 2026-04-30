const mongoose = require("mongoose");

const serviceFinalSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    type: {
      type: String,
      enum: ["base", "bargataire"],
      required: true,
    },
    quantiteKg: { type: Number, required: true, default: 0 },
    etat: {
      type: String,
      enum: ["dispo", "vendu"],
      default: "dispo",
    },
    commentaire: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceFinal", serviceFinalSchema);
