const CaisseEntry = require("../models/CaisseEntry");
const Facture = require("../models/Facture");
const ServiceFacture = require("../models/ServiceFacture");

// Get all manual caisse entries
exports.getAllEntries = async (req, res) => {
  try {
    const entries = await CaisseEntry.find().sort({ date: -1 });
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a manual caisse entry
exports.createEntry = async (req, res) => {
  try {
    const { type, description, montant, date } = req.body;
    if (!type || !["depense", "vente", "reste"].includes(type)) {
      return res.status(400).json({ message: "Le type doit être 'depense', 'vente' ou 'reste'" });
    }
    if (!description || !montant || !date) {
      return res.status(400).json({ message: "Description, montant et date sont requis" });
    }
    if (Number(montant) <= 0) {
      return res.status(400).json({ message: "Le montant doit être supérieur à 0" });
    }
    const entry = new CaisseEntry({ type, description, montant: Number(montant), date });
    await entry.save();
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a manual caisse entry
exports.deleteEntry = async (req, res) => {
  try {
    const entry = await CaisseEntry.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entrée introuvable" });
    res.status(200).json({ message: "Supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get caisse summary (auto from factures + manual entries)
exports.getSummary = async (req, res) => {
  try {
    // Auto expenses from production factures
    const prodFactureAgg = await Facture.aggregate([
      { $group: { _id: null, total: { $sum: "$prixDiverse" } } },
    ]);
    const depensesFacturesProd = prodFactureAgg[0]?.total || 0;

    // Auto expenses from service factures
    let depensesFacturesService = 0;
    try {
      const serviceFactureAgg = await ServiceFacture.aggregate([
        { $group: { _id: null, total: { $sum: "$prixDiverse" } } },
      ]);
      depensesFacturesService = serviceFactureAgg[0]?.total || 0;
    } catch (e) {
      // ServiceFacture model may not exist yet
    }

    // Manual entries
    const manualDepensesAgg = await CaisseEntry.aggregate([
      { $match: { type: "depense" } },
      { $group: { _id: null, total: { $sum: "$montant" } } },
    ]);
    const depensesManuelles = manualDepensesAgg[0]?.total || 0;

    const ventesAgg = await CaisseEntry.aggregate([
      { $match: { type: "vente" } },
      { $group: { _id: null, total: { $sum: "$montant" } } },
    ]);
    const ventes = ventesAgg[0]?.total || 0;

    const restesAgg = await CaisseEntry.aggregate([
      { $match: { type: "reste" } },
      { $group: { _id: null, total: { $sum: "$montant" } } },
    ]);
    const restes = restesAgg[0]?.total || 0;

    const totalDepenses = depensesFacturesProd + depensesFacturesService + depensesManuelles;
    const solde = ventes - totalDepenses;

    res.status(200).json({
      depensesFacturesProd,
      depensesFacturesService,
      depensesManuelles,
      totalDepenses,
      ventes,
      restes,
      solde,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
