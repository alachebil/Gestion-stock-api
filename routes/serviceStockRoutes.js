const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/serviceStockController");

// Produit Semi-Prêt (achat direct)
router.post("/semi-pret", ctrl.createSemiPret);
router.get("/semi-pret", ctrl.getAllSemiPrets);
router.put("/semi-pret/:id", ctrl.updateSemiPret);
router.delete("/semi-pret/:id", ctrl.deleteSemiPret);

// Produit Final
router.post("/final", ctrl.createFinal);
router.get("/final", ctrl.getAllFinals);
router.put("/final/etat/:id", ctrl.toggleEtatFinal);
router.put("/final/:id", ctrl.updateFinal);
router.delete("/final/:id", ctrl.deleteFinal);

// Résumé du stock
router.get("/summary", ctrl.getSummary);

// Compteurs
router.get("/counters", ctrl.getCounters);

// Initialiser les compteurs
router.post("/init-counters", ctrl.initCounters);

// Historique des transformations
router.get("/transformations", ctrl.getTransformationHistory);
router.delete("/transformations/:id", ctrl.deleteTransformationHistory);

module.exports = router;
