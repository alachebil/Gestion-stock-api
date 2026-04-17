const ServiceSemiPret = require("../models/ServiceSemiPret");
const ServiceFinal = require("../models/ServiceFinal");
const ServiceStockCounter = require("../models/ServiceStockCounter");
const ServiceTransformationHistory = require("../models/ServiceTransformationHistory");

// ==================== PRODUIT SEMI-PRET (Achat direct) ====================

exports.createSemiPret = async (req, res) => {
  try {
    const { nom, type, quantiteKg } = req.body;
    if (!quantiteKg || quantiteKg <= 0) {
      return res.status(400).json({ message: "La quantité doit être supérieure à 0" });
    }

    const item = new ServiceSemiPret({ nom, type, quantiteKg: Number(quantiteKg) });
    await item.save();

    const counter = await ServiceStockCounter.getOrCreate(`semi-pret-${type}`);
    counter.totalKg += Number(quantiteKg);
    await counter.save();

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllSemiPrets = async (req, res) => {
  try {
    const items = await ServiceSemiPret.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSemiPret = async (req, res) => {
  try {
    const oldItem = await ServiceSemiPret.findById(req.params.id);
    if (!oldItem) return res.status(404).json({ message: "Produit semi-prêt introuvable" });

    const oldQty = oldItem.quantiteKg;
    const oldType = oldItem.type;
    const item = await ServiceSemiPret.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (oldType !== item.type || oldQty !== item.quantiteKg) {
      const oldCounter = await ServiceStockCounter.getOrCreate(`semi-pret-${oldType}`);
      oldCounter.totalKg = Math.max(0, oldCounter.totalKg - oldQty);
      await oldCounter.save();

      const newCounter = await ServiceStockCounter.getOrCreate(`semi-pret-${item.type}`);
      newCounter.totalKg += item.quantiteKg;
      await newCounter.save();
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSemiPret = async (req, res) => {
  try {
    const item = await ServiceSemiPret.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Produit semi-prêt introuvable" });

    const counter = await ServiceStockCounter.getOrCreate(`semi-pret-${item.type}`);
    counter.totalKg = Math.max(0, counter.totalKg - item.quantiteKg);
    await counter.save();

    res.status(200).json({ message: "Supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== PRODUIT FINAL ====================

exports.createFinal = async (req, res) => {
  try {
    const { type, quantiteKg } = req.body;
    if (!quantiteKg || quantiteKg <= 0) {
      return res.status(400).json({ message: "La quantité doit être supérieure à 0" });
    }
    if (!type || !["base", "bargataire"].includes(type)) {
      return res.status(400).json({ message: "Le type doit être 'base' ou 'bargataire'" });
    }

    const consumed = Number(quantiteKg) + Number(quantiteKg) * 0.01;

    const semiPretCounter = await ServiceStockCounter.getOrCreate(`semi-pret-${type}`);
    if (semiPretCounter.totalKg < consumed) {
      return res.status(400).json({
        message: `Stock semi-prêt service ${type} insuffisant. Besoin de ${consumed.toFixed(2)} kg (${quantiteKg} + 1%), disponible: ${semiPretCounter.totalKg.toFixed(2)} kg`,
      });
    }

    // Auto-generate name
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const dateStr = `${dd}${mm}${yyyy}`;
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const todayCount = await ServiceFinal.countDocuments({ createdAt: { $gte: startOfDay, $lt: endOfDay } });
    const nom = `JS-${dateStr}-${todayCount + 1}`;

    semiPretCounter.totalKg -= consumed;
    await semiPretCounter.save();

    const finalCounter = await ServiceStockCounter.getOrCreate(`final-${type}`);
    finalCounter.totalKg += Number(quantiteKg);
    await finalCounter.save();

    const item = new ServiceFinal({ nom, type, quantiteKg: Number(quantiteKg) });
    await item.save();

    await ServiceTransformationHistory.create({
      type: "SemiPret→Final",
      sourceNom: `Stock Semi-Prêt Service ${type}`,
      destinationNom: nom,
      quantiteKg: Number(quantiteKg),
      dateTransformation: new Date(),
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllFinals = async (req, res) => {
  try {
    const items = await ServiceFinal.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateFinal = async (req, res) => {
  try {
    const oldItem = await ServiceFinal.findById(req.params.id);
    if (!oldItem) return res.status(404).json({ message: "Produit final introuvable" });

    const oldQty = oldItem.quantiteKg;
    const oldType = oldItem.type;
    const item = await ServiceFinal.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (oldType !== item.type || oldQty !== item.quantiteKg) {
      const oldCounter = await ServiceStockCounter.getOrCreate(`final-${oldType}`);
      oldCounter.totalKg = Math.max(0, oldCounter.totalKg - oldQty);
      await oldCounter.save();

      const newCounter = await ServiceStockCounter.getOrCreate(`final-${item.type}`);
      newCounter.totalKg += item.quantiteKg;
      await newCounter.save();
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteFinal = async (req, res) => {
  try {
    const item = await ServiceFinal.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Produit final introuvable" });

    const counter = await ServiceStockCounter.getOrCreate(`final-${item.type}`);
    counter.totalKg = Math.max(0, counter.totalKg - item.quantiteKg);
    await counter.save();

    res.status(200).json({ message: "Supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== RÉSUMÉ DU STOCK SERVICE ====================
exports.getSummary = async (req, res) => {
  try {
    const spBase = await ServiceStockCounter.getOrCreate("semi-pret-base");
    const spBarg = await ServiceStockCounter.getOrCreate("semi-pret-bargataire");
    const fBase = await ServiceStockCounter.getOrCreate("final-base");
    const fBarg = await ServiceStockCounter.getOrCreate("final-bargataire");

    const spBaseCount = await ServiceSemiPret.countDocuments({ type: "base" });
    const spBargCount = await ServiceSemiPret.countDocuments({ type: "bargataire" });
    const fBaseCount = await ServiceFinal.countDocuments({ type: "base" });
    const fBargCount = await ServiceFinal.countDocuments({ type: "bargataire" });

    res.status(200).json({
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

// ==================== COMPTEURS ====================
exports.getCounters = async (req, res) => {
  try {
    const spBase = await ServiceStockCounter.getOrCreate("semi-pret-base");
    const spBarg = await ServiceStockCounter.getOrCreate("semi-pret-bargataire");
    const fBase = await ServiceStockCounter.getOrCreate("final-base");
    const fBarg = await ServiceStockCounter.getOrCreate("final-bargataire");
    res.status(200).json({
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
    const spBaseAgg = await ServiceSemiPret.aggregate([{ $match: { type: "base" } }, { $group: { _id: null, total: { $sum: "$quantiteKg" } } }]);
    const spBargAgg = await ServiceSemiPret.aggregate([{ $match: { type: "bargataire" } }, { $group: { _id: null, total: { $sum: "$quantiteKg" } } }]);
    const fBaseAgg = await ServiceFinal.aggregate([{ $match: { type: "base" } }, { $group: { _id: null, total: { $sum: "$quantiteKg" } } }]);
    const fBargAgg = await ServiceFinal.aggregate([{ $match: { type: "bargataire" } }, { $group: { _id: null, total: { $sum: "$quantiteKg" } } }]);

    const spb = await ServiceStockCounter.getOrCreate("semi-pret-base");
    spb.totalKg = spBaseAgg[0]?.total || 0; await spb.save();
    const spbg = await ServiceStockCounter.getOrCreate("semi-pret-bargataire");
    spbg.totalKg = spBargAgg[0]?.total || 0; await spbg.save();
    const fb = await ServiceStockCounter.getOrCreate("final-base");
    fb.totalKg = fBaseAgg[0]?.total || 0; await fb.save();
    const fbg = await ServiceStockCounter.getOrCreate("final-bargataire");
    fbg.totalKg = fBargAgg[0]?.total || 0; await fbg.save();

    await ServiceStockCounter.deleteMany({ type: { $in: ["semi-pret", "final"] } });

    res.status(200).json({
      message: "Compteurs service initialisés",
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
    const history = await ServiceTransformationHistory.find().sort({ dateTransformation: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTransformationHistory = async (req, res) => {
  try {
    const item = await ServiceTransformationHistory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Entrée introuvable" });
    res.status(200).json({ message: "Supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== TOGGLE ETAT PRODUIT FINAL ====================
exports.toggleEtatFinal = async (req, res) => {
  try {
    const item = await ServiceFinal.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Produit final introuvable" });
    item.etat = item.etat === "dispo" ? "vendu" : "dispo";
    await item.save();
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
