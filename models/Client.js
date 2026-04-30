const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    telephone: { type: String, required: true },
    adresse: { type: String, required: true },
    immatriculationFiscale: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
