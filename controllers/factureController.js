const Facture = require("../models/Facture");
const MatierePremiere = require("../models/MatierePremiere");
const StockCounter = require("../models/StockCounter");

exports.createFacture = async (req, res) => {
  try {
    const { dateLivraison, prixDiverse, prixTotal, numTelephone, quantitePortee, refMatierePremiere } = req.body;

    const todayStr = new Date().toISOString().split("T")[0];
    if (dateLivraison > todayStr) {
      return res.status(400).json({ message: "La date de facture ne peut pas dépasser la date d'aujourd'hui" });
    }
    if (prixTotal < prixDiverse) {
      return res.status(400).json({ message: "Le prix total doit être supérieur ou égal au prix diversé" });
    }
    if (!/^\d{8}$/.test(numTelephone)) {
      return res.status(400).json({ message: "Le numéro de téléphone doit contenir exactement 8 chiffres" });
    }
    if (!quantitePortee || quantitePortee <= 0) {
      return res.status(400).json({ message: "La quantité doit être supérieure à 0" });
    }

    const facture = new Facture(req.body);
    await facture.save();

    // Ajouter automatiquement la matière première
    const existingMP = await MatierePremiere.findOne({ nom: refMatierePremiere });
    if (existingMP) {
      existingMP.quantiteKg += quantitePortee;
      await existingMP.save();
    } else {
      await MatierePremiere.create({ nom: refMatierePremiere, quantiteKg: quantitePortee });
    }

    // Mettre à jour le stock total de matière première
    const counter = await StockCounter.getOrCreate("matiere");
    counter.totalKg += Number(quantitePortee);
    await counter.save();

    res.status(201).json(facture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllFactures = async (req, res) => {
  try {
    const factures = await Facture.find().sort({ createdAt: -1 });
    res.status(200).json(factures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFactureById = async (req, res) => {
  try {
    const facture = await Facture.findById(req.params.id);
    if (!facture) return res.status(404).json({ message: "Facture introuvable" });
    res.status(200).json(facture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateFacture = async (req, res) => {
  try {
    const { dateLivraison, prixDiverse, prixTotal, numTelephone, quantitePortee } = req.body;

    const todayStr = new Date().toISOString().split("T")[0];
    if (dateLivraison > todayStr) {
      return res.status(400).json({ message: "La date de facture ne peut pas dépasser la date d'aujourd'hui" });
    }
    if (prixTotal < prixDiverse) {
      return res.status(400).json({ message: "Le prix total doit être supérieur ou égal au prix diversé" });
    }
    if (!/^\d{8}$/.test(numTelephone)) {
      return res.status(400).json({ message: "Le numéro de téléphone doit contenir exactement 8 chiffres" });
    }
    if (!quantitePortee || quantitePortee <= 0) {
      return res.status(400).json({ message: "La quantité doit être supérieure à 0" });
    }

    const facture = await Facture.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!facture) return res.status(404).json({ message: "Facture introuvable" });
    res.status(200).json(facture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteFacture = async (req, res) => {
  try {
    const facture = await Facture.findByIdAndDelete(req.params.id);
    if (!facture) return res.status(404).json({ message: "Facture introuvable" });
    res.status(200).json({ message: "Facture supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
