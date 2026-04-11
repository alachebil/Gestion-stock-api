const ServiceFacture = require("../models/ServiceFacture");

exports.createFacture = async (req, res) => {
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

    const facture = new ServiceFacture(req.body);
    await facture.save();
    res.status(201).json(facture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllFactures = async (req, res) => {
  try {
    const factures = await ServiceFacture.find().sort({ createdAt: -1 });
    res.status(200).json(factures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFactureById = async (req, res) => {
  try {
    const facture = await ServiceFacture.findById(req.params.id);
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

    const facture = await ServiceFacture.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!facture) return res.status(404).json({ message: "Facture introuvable" });
    res.status(200).json(facture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteFacture = async (req, res) => {
  try {
    const facture = await ServiceFacture.findByIdAndDelete(req.params.id);
    if (!facture) return res.status(404).json({ message: "Facture introuvable" });
    res.status(200).json({ message: "Facture supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
