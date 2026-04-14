const express = require("express");
const router = express.Router();
const venteController = require("../controllers/venteController");

router.get("/", venteController.getAllVentes);
router.post("/", venteController.createVente);

module.exports = router;
