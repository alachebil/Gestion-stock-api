const mongoose = require("mongoose");

const serviceSemiPretSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    type: {
      type: String,
      enum: ["base", "bargatere"],
      required: true,
    },
    quantiteKg: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceSemiPret", serviceSemiPretSchema);
