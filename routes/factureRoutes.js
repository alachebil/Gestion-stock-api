const express = require("express");
const router = express.Router();
const factureController = require("../controllers/factureController");

router.post("/", factureController.createFacture);
router.get("/", factureController.getAllFactures);
router.get("/:id", factureController.getFactureById);
router.put("/:id", factureController.updateFacture);
router.delete("/:id", factureController.deleteFacture);

module.exports = router;
