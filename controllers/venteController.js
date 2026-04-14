const Vente = require("../models/Vente");
const ProduitFinal = require("../models/ProduitFinal");
const ServiceFinal = require("../models/ServiceFinal");
const StockCounter = require("../models/StockCounter");
const ServiceStockCounter = require("../models/ServiceStockCounter");
const CaisseEntry = require("../models/CaisseEntry");
const Client = require("../models/Client");

exports.createVente = async (req, res) => {
  try {
    const { clientId, produitIds, prixParType, chauffeur, matriculation, source } = req.body;

    if (!clientId || !produitIds?.length || !prixParType?.length || !chauffeur || !matriculation || !source) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: "Client introuvable" });

    const Model = source === "service" ? ServiceFinal : ProduitFinal;
    const CounterModel = source === "service" ? ServiceStockCounter : StockCounter;

    // Fetch all products and validate
    const produits = await Model.find({ _id: { $in: produitIds }, etat: "dispo" });
    if (produits.length !== produitIds.length) {
      return res.status(400).json({ message: "Certains produits sont introuvables ou déjà vendus" });
    }

    // Group by type
    const groupedByType = {};
    produits.forEach((p) => {
      if (!groupedByType[p.type]) groupedByType[p.type] = { totalKg: 0, items: [] };
      groupedByType[p.type].totalKg += p.quantiteKg;
      groupedByType[p.type].items.push(p);
    });

    // Build prixParType with totals
    const prixParTypeData = [];
    let totalGeneral = 0;

    for (const entry of prixParType) {
      const group = groupedByType[entry.type];
      if (!group) continue;
      const sousTotal = group.totalKg * Number(entry.prixKg);
      totalGeneral += sousTotal;
      prixParTypeData.push({
        type: entry.type,
        totalKg: group.totalKg,
        prixKg: Number(entry.prixKg),
        sousTotal,
      });
    }

    // Mark all products as vendu and decrement counters
    for (const p of produits) {
      p.etat = "vendu";
      await p.save();

      const counter = await CounterModel.getOrCreate(`final-${p.type}`);
      counter.totalKg = Math.max(0, counter.totalKg - p.quantiteKg);
      await counter.save();
    }

    // Build produits array for the vente document
    const produitsData = produits.map((p) => ({
      produitId: p._id,
      nom: p.nom,
      type: p.type,
      quantiteKg: p.quantiteKg,
    }));

    const vente = new Vente({
      client: clientId,
      produits: produitsData,
      prixParType: prixParTypeData,
      totalGeneral,
      chauffeur,
      matriculation,
      source,
      dateVente: new Date(),
    });
    await vente.save();

    // Auto-add to caisse
    await CaisseEntry.create({
      type: "vente",
      description: `Vente ${source} - ${client.nom} - ${produits.length} produit(s)`,
      montant: totalGeneral,
      date: new Date(),
    });

    const populatedVente = await Vente.findById(vente._id).populate("client");
    res.status(201).json(populatedVente);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllVentes = async (req, res) => {
  try {
    const ventes = await Vente.find().populate("client").sort({ dateVente: -1 });
    res.status(200).json(ventes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
