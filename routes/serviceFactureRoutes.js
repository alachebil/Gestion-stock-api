const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/serviceFactureController");

router.post("/", ctrl.createFacture);
router.get("/", ctrl.getAllFactures);
router.get("/:id", ctrl.getFactureById);
router.put("/:id", ctrl.updateFacture);
router.delete("/:id", ctrl.deleteFacture);

module.exports = router;
