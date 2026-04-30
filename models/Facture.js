const mongoose = require("mongoose");

const factureSchema = new mongoose.Schema(
  {
    nomFournisseur: { type: String, required: true },
    numTelephone: { type: String, required: true },
    adresse: { type: String, default: "" },
    refMatierePremiere: { type: String, required: true },
    quantitePortee: { type: Number, required: true },
    prixTotal: { type: Number, required: true },
    prixUnite: { type: Number, required: true },
    prixDiverse: { type: Number, required: true },
    dateLivraison: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Facture", factureSchema);
