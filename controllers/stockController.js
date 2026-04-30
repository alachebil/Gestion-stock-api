const MatierePremiere = require("../models/MatierePremiere");
const ProduitSemiPret = require("../models/ProduitSemiPret");
const ProduitFinal = require("../models/ProduitFinal");
const TransformationHistory = require("../models/TransformationHistory");
const StockCounter = require("../models/StockCounter");

// ==================== MATIERE PREMIERE ====================

exports.createMatierePremiere = async (req, res) => {
  try {
    const item = new MatierePremiere(req.body);
    await item.save();

    const counter = await StockCounter.getOrCreate("matiere");
    counter.totalKg += Number(req.body.quantiteKg);
    await counter.save();

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
    const oldItem = await MatierePremiere.findById(req.params.id);
    if (!oldItem) return res.status(404).json({ message: "Matière première introuvable" });

    const oldQty = oldItem.quantiteKg;
    const item = await MatierePremiere.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (req.body.quantiteKg !== undefined) {
      const diff = Number(req.body.quantiteKg) - oldQty;
      const counter = await StockCounter.getOrCreate("matiere");
      counter.totalKg += diff;
      await counter.save();
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMatierePremiere = async (req, res) => {
  try {
    const item = await MatierePremiere.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Matière première introuvable" });

    const counter = await StockCounter.getOrCreate("matiere");
    counter.totalKg = Math.max(0, counter.totalKg - item.quantiteKg);
    await counter.save();

    res.status(200).json({ message: "Supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== PRODUIT SEMI PRET ====================

exports.createProduitSemiPret = async (req, res) => {
  try {
    const { nom, type, quantiteKg } = req.body;
    if (!quantiteKg || quantiteKg <= 0) {
      return res.status(400).json({ message: "La quantité doit être supérieure à 0" });
    }

    const consumed = Number(quantiteKg) + Number(quantiteKg) * 0.01;

    const matiereCounter = await StockCounter.getOrCreate("matiere");
    if (matiereCounter.totalKg < consumed) {
      return res.status(400).json({
        message: `Stock MP insuffisant. Besoin de ${consumed.toFixed(2)} kg (${quantiteKg} + 1%), disponible: ${matiereCounter.totalKg.toFixed(2)} kg`,
      });
    }

    matiereCounter.totalKg -= consumed;
    await matiereCounter.save();

    const semiPretCounter = await StockCounter.getOrCreate(`semi-pret-${type}`);
    semiPretCounter.totalKg += Number(quantiteKg);
    await semiPretCounter.save();

    const item = new ProduitSemiPret({ nom, type, quantiteKg: Number(quantiteKg) });
    await item.save();

    await TransformationHistory.create({
      type: "MP→SemiPret",
      sourceNom: "Stock Matière Première",
      destinationNom: nom,
      quantiteKg: Number(quantiteKg),
      dateTransformation: new Date(),
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllProduitSemiPrets = async (req, res) => {
  try {
    const items = await ProduitSemiPret.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduitSemiPret = async (req, res) => {
  try {
    const item = await ProduitSemiPret.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Produit semi-prêt introuvable" });

    const counter = await StockCounter.getOrCreate(`semi-pret-${item.type}`);
    counter.totalKg = Math.max(0, counter.totalKg - item.quantiteKg);
    await counter.save();

    res.status(200).json({ message: "Supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduitSemiPret = async (req, res) => {
  try {
    const oldItem = await ProduitSemiPret.findById(req.params.id);
    if (!oldItem) return res.status(404).json({ message: "Produit semi-prêt introuvable" });

    const oldQty = oldItem.quantiteKg;
    const oldType = oldItem.type;
    const item = await ProduitSemiPret.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (oldType !== item.type || oldQty !== item.quantiteKg) {
      const oldCounter = await StockCounter.getOrCreate(`semi-pret-${oldType}`);
      oldCounter.totalKg = Math.max(0, oldCounter.totalKg - oldQty);
      await oldCounter.save();

      const newCounter = await StockCounter.getOrCreate(`semi-pret-${item.type}`);
      newCounter.totalKg += item.quantiteKg;
      await newCounter.save();
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== PRODUIT FINAL ====================

exports.createProduitFinal = async (req, res) => {
  try {
    const { type, quantiteKg, commentaire } = req.body;
    if (!quantiteKg || quantiteKg <= 0) {
      return res.status(400).json({ message: "La quantité doit être supérieure à 0" });
    }
    if (!type || !["base", "bargataire"].includes(type)) {
      return res.status(400).json({ message: "Le type doit être 'base' ou 'bargataire'" });
    }

    const consumed = Number(quantiteKg) + Number(quantiteKg) * 0.01;

    const semiPretCounter = await StockCounter.getOrCreate(`semi-pret-${type}`);
    if (semiPretCounter.totalKg < consumed) {
      return res.status(400).json({
        message: `Stock semi-prêt ${type} insuffisant. Besoin de ${consumed.toFixed(2)} kg (${quantiteKg} + 1%), disponible: ${semiPretCounter.totalKg.toFixed(2)} kg`,
      });
    }

    // Auto-generate name: J-DDMMYYYY-N
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const dateStr = `${dd}${mm}${yyyy}`;
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const todayCount = await ProduitFinal.countDocuments({ createdAt: { $gte: startOfDay, $lt: endOfDay } });
    const nom = `J-${dateStr}-${todayCount + 1}`;

    semiPretCounter.totalKg -= consumed;
    await semiPretCounter.save();

    const finalCounter = await StockCounter.getOrCreate(`final-${type}`);
    finalCounter.totalKg += Number(quantiteKg);
    await finalCounter.save();

    const item = new ProduitFinal({ nom, type, quantiteKg: Number(quantiteKg), commentaire: commentaire || "" });
    await item.save();

    await TransformationHistory.create({
      type: "SemiPret→Final",
      sourceNom: `Stock Semi-Prêt ${type}`,
      destinationNom: nom,
      quantiteKg: Number(quantiteKg),
      dateTransformation: new Date(),
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllProduitFinals = async (req, res) => {
  try {
    const items = await ProduitFinal.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduitFinal = async (req, res) => {
  try {
    const item = await ProduitFinal.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Produit final introuvable" });

    const counter = await StockCounter.getOrCreate(`final-${item.type}`);
    counter.totalKg = Math.max(0, counter.totalKg - item.quantiteKg);
    await counter.save();

    res.status(200).json({ message: "Supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduitFinal = async (req, res) => {
  try {
    const oldItem = await ProduitFinal.findById(req.params.id);
    if (!oldItem) return res.status(404).json({ message: "Produit final introuvable" });

    const oldQty = oldItem.quantiteKg;
    const oldType = oldItem.type;
    const item = await ProduitFinal.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (oldType !== item.type || oldQty !== item.quantiteKg) {
      const oldCounter = await StockCounter.getOrCreate(`final-${oldType}`);
      oldCounter.totalKg = Math.max(0, oldCounter.totalKg - oldQty);
      await oldCounter.save();

      const newCounter = await StockCounter.getOrCreate(`final-${item.type}`);
      newCounter.totalKg += item.quantiteKg;
      await newCounter.save();
    }

    res.status(200).json(item);
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

    await TransformationHistory.create({
      type: "MP→SemiPret",
      sourceNom: matiere.nom,
      destinationNom: semiPret.nom,
      quantiteKg,
      dateTransformation: new Date(),
    });

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

    await TransformationHistory.create({
      type: "SemiPret→Final",
      sourceNom: semiPret.nom,
      destinationNom: final_.nom,
      quantiteKg,
      dateTransformation: new Date(),
    });

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
    const matiereCounter = await StockCounter.getOrCreate("matiere");
    const spBase = await StockCounter.getOrCreate("semi-pret-base");
    const spBarg = await StockCounter.getOrCreate("semi-pret-bargataire");
    const fBase = await StockCounter.getOrCreate("final-base");
    const fBarg = await StockCounter.getOrCreate("final-bargataire");

    const matiereCount = await MatierePremiere.countDocuments();
    const spBaseCount = await ProduitSemiPret.countDocuments({ type: "base" });
    const spBargCount = await ProduitSemiPret.countDocuments({ type: "bargataire" });
    const fBaseCount = await ProduitFinal.countDocuments({ type: "base" });
    const fBargCount = await ProduitFinal.countDocuments({ type: "bargataire" });

    res.status(200).json({
      matierePremieres: [{ _id: "Matière Première", totalKg: matiereCounter.totalKg, count: matiereCount }],
      produitsSemiPrets: [
        { _id: "Semi-Prêt Base", totalKg: spBase.totalKg, count: spBaseCount },
        { _id: "Semi-Prêt Bargataire", totalKg: spBarg.totalKg, count: spBargCount },
      ],
      produitsFinals: [
        { _id: "Final Base", totalKg: fBase.totalKg, count: fBaseCount },
        { _id: "Final Bargataire", totalKg: fBarg.totalKg, count: fBargCount },
      ],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== COMPTEURS DE STOCK ====================
exports.getStockCounters = async (req, res) => {
  try {
    const matiere = await StockCounter.getOrCreate("matiere");
    const spBase = await StockCounter.getOrCreate("semi-pret-base");
    const spBarg = await StockCounter.getOrCreate("semi-pret-bargataire");
    const fBase = await StockCounter.getOrCreate("final-base");
    const fBarg = await StockCounter.getOrCreate("final-bargataire");
    res.status(200).json({
      matiere: matiere.totalKg,
      semiPretBase: spBase.totalKg,
      semiPretbargataire: spBarg.totalKg,
      finalBase: fBase.totalKg,
      finalbargataire: fBarg.totalKg,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== INITIALISER COMPTEURS ====================
exports.initCounters = async (req, res) => {
  try {
    const matiereAgg = await MatierePremiere.aggregate([{ $group: { _id: null, total: { $sum: "$quantiteKg" } } }]);
    const spBaseAgg = await ProduitSemiPret.aggregate([{ $match: { type: "base" } }, { $group: { _id: null, total: { $sum: "$quantiteKg" } } }]);
    const spBargAgg = await ProduitSemiPret.aggregate([{ $match: { type: "bargataire" } }, { $group: { _id: null, total: { $sum: "$quantiteKg" } } }]);
    const fBaseAgg = await ProduitFinal.aggregate([{ $match: { type: "base" } }, { $group: { _id: null, total: { $sum: "$quantiteKg" } } }]);
    const fBargAgg = await ProduitFinal.aggregate([{ $match: { type: "bargataire" } }, { $group: { _id: null, total: { $sum: "$quantiteKg" } } }]);

    const mc = await StockCounter.getOrCreate("matiere");
    mc.totalKg = matiereAgg[0]?.total || 0; await mc.save();
    const spb = await StockCounter.getOrCreate("semi-pret-base");
    spb.totalKg = spBaseAgg[0]?.total || 0; await spb.save();
    const spbg = await StockCounter.getOrCreate("semi-pret-bargataire");
    spbg.totalKg = spBargAgg[0]?.total || 0; await spbg.save();
    const fb = await StockCounter.getOrCreate("final-base");
    fb.totalKg = fBaseAgg[0]?.total || 0; await fb.save();
    const fbg = await StockCounter.getOrCreate("final-bargataire");
    fbg.totalKg = fBargAgg[0]?.total || 0; await fbg.save();

    await StockCounter.deleteMany({ type: { $in: ["semi-pret", "final"] } });

    res.status(200).json({
      message: "Compteurs initialisés",
      matiere: mc.totalKg,
      semiPretBase: spb.totalKg, semiPretbargataire: spbg.totalKg,
      finalBase: fb.totalKg, finalbargataire: fbg.totalKg,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== HISTORIQUE DES TRANSFORMATIONS ====================
exports.getTransformationHistory = async (req, res) => {
  try {
    const history = await TransformationHistory.find().sort({ dateTransformation: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTransformationHistory = async (req, res) => {
  try {
    const item = await TransformationHistory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Entrée introuvable" });
    res.status(200).json({ message: "Supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== TOGGLE ETAT PRODUIT FINAL ====================
exports.toggleEtatProduitFinal = async (req, res) => {
  try {
    const item = await ProduitFinal.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Produit final introuvable" });
    item.etat = item.etat === "dispo" ? "vendu" : "dispo";
    await item.save();
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
