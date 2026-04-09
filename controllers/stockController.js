const MatierePremiere = require("../models/MatierePremiere");
const ProduitSemiPret = require("../models/ProduitSemiPret");
const ProduitFinal = require("../models/ProduitFinal");

// ==================== MATIERE PREMIERE ====================

exports.createMatierePremiere = async (req, res) => {
  try {
    const item = new MatierePremiere(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllMatierePremieres = async (req, res) => {
  try {
    const items = await MatierePremiere.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMatierePremiere = async (req, res) => {
  try {
    const item = await MatierePremiere.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Matière première introuvable" });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMatierePremiere = async (req, res) => {
  try {
    const item = await MatierePremiere.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Matière première introuvable" });
    res.status(200).json({ message: "Supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== PRODUIT SEMI PRET ====================

exports.createProduitSemiPret = async (req, res) => {
  try {
    const item = new ProduitSemiPret(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllProduitSemiPrets = async (req, res) => {
  try {
    const items = await ProduitSemiPret.find().populate("matiereSource");
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduitSemiPret = async (req, res) => {
  try {
    const item = await ProduitSemiPret.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Produit semi-prêt introuvable" });
    res.status(200).json({ message: "Supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== PRODUIT FINAL ====================

exports.createProduitFinal = async (req, res) => {
  try {
    const item = new ProduitFinal(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllProduitFinals = async (req, res) => {
  try {
    const items = await ProduitFinal.find().populate("produitSemiPretSource");
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduitFinal = async (req, res) => {
  try {
    const item = await ProduitFinal.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Produit final introuvable" });
    res.status(200).json({ message: "Supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== TRANSFORMATION: MP -> Semi-Prêt ====================
// Consomme de la matière première pour produire du produit semi-prêt
exports.transformerEnSemiPret = async (req, res) => {
  try {
    const { matiereId, produitSemiPretId, quantiteKg } = req.body;

    if (!matiereId || !produitSemiPretId || !quantiteKg || quantiteKg <= 0) {
      return res.status(400).json({ message: "Données invalides" });
    }

    const matiere = await MatierePremiere.findById(matiereId);
    if (!matiere) return res.status(404).json({ message: "Matière première introuvable" });
    if (matiere.quantiteKg < quantiteKg) {
      return res.status(400).json({ message: "Stock de matière première insuffisant" });
    }

    const semiPret = await ProduitSemiPret.findById(produitSemiPretId);
    if (!semiPret) return res.status(404).json({ message: "Produit semi-prêt introuvable" });

    matiere.quantiteKg -= quantiteKg;
    semiPret.quantiteKg += quantiteKg;

    await matiere.save();
    await semiPret.save();

    res.status(200).json({
      message: `Transformation réussie: ${quantiteKg} kg de matière première → produit semi-prêt`,
      matiere,
      semiPret,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== TRANSFORMATION: Semi-Prêt -> Final ====================
// Consomme du produit semi-prêt pour produire du produit final
exports.transformerEnFinal = async (req, res) => {
  try {
    const { produitSemiPretId, produitFinalId, quantiteKg } = req.body;

    if (!produitSemiPretId || !produitFinalId || !quantiteKg || quantiteKg <= 0) {
      return res.status(400).json({ message: "Données invalides" });
    }

    const semiPret = await ProduitSemiPret.findById(produitSemiPretId);
    if (!semiPret) return res.status(404).json({ message: "Produit semi-prêt introuvable" });
    if (semiPret.quantiteKg < quantiteKg) {
      return res.status(400).json({ message: "Stock de produit semi-prêt insuffisant" });
    }

    const final_ = await ProduitFinal.findById(produitFinalId);
    if (!final_) return res.status(404).json({ message: "Produit final introuvable" });

    semiPret.quantiteKg -= quantiteKg;
    final_.quantiteKg += quantiteKg;

    await semiPret.save();
    await final_.save();

    res.status(200).json({
      message: `Transformation réussie: ${quantiteKg} kg de semi-prêt → produit final`,
      semiPret,
      final: final_,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== RÉSUMÉ DU STOCK ====================
exports.getStockSummary = async (req, res) => {
  try {
    const matieres = await MatierePremiere.aggregate([
      { $group: { _id: "$type", totalKg: { $sum: "$quantiteKg" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const semiPrets = await ProduitSemiPret.aggregate([
      { $group: { _id: "$type", totalKg: { $sum: "$quantiteKg" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const finals = await ProduitFinal.aggregate([
      { $group: { _id: "Produit Final", totalKg: { $sum: "$quantiteKg" }, count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      matierePremieres: matieres,
      produitsSemiPrets: semiPrets,
      produitsFinals: finals,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
