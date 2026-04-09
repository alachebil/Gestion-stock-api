const mongoose = require("mongoose");

const transformationHistorySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["MP→SemiPret", "SemiPret→Final"],
      required: true,
    },
    sourceNom: { type: String, required: true },
    destinationNom: { type: String, required: true },
    quantiteKg: { type: Number, required: true },
    dateTransformation: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TransformationHistory", transformationHistorySchema);
