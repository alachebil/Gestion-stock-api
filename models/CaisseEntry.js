const mongoose = require("mongoose");

const caisseEntrySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["depense", "vente"],
      required: true,
    },
    description: { type: String, required: true },
    montant: { type: Number, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CaisseEntry", caisseEntrySchema);
