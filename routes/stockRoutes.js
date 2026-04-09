const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stockController");

// Matière Première
router.post("/matiere", stockController.createMatierePremiere);
router.get("/matiere", stockController.getAllMatierePremieres);
router.put("/matiere/:id", stockController.updateMatierePremiere);
router.delete("/matiere/:id", stockController.deleteMatierePremiere);

// Produit Semi-Prêt
router.post("/semi-pret", stockController.createProduitSemiPret);
router.get("/semi-pret", stockController.getAllProduitSemiPrets);
router.delete("/semi-pret/:id", stockController.deleteProduitSemiPret);

// Produit Final
router.post("/final", stockController.createProduitFinal);
router.get("/final", stockController.getAllProduitFinals);
router.delete("/final/:id", stockController.deleteProduitFinal);

// Transformations
router.post("/transformer/semi-pret", stockController.transformerEnSemiPret);
router.post("/transformer/final", stockController.transformerEnFinal);

// Résumé du stock
router.get("/summary", stockController.getStockSummary);

module.exports = router;
