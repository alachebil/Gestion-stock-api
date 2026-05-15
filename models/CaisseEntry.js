const mongoose = require("mongoose");

const caisseEntrySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["depense", "vente", "reste"],
      required: true,
    },
    description: { type: String, required: true },
    montant: { type: Number, required: true },
    date: { type: Date, required: true },
    paymentMethod: {
      type: String,
      enum: ["versement", "virement", "espece", null],
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CaisseEntry", caisseEntrySchema);
