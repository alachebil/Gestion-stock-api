const express = require("express");
const router = express.Router();
const caisseController = require("../controllers/caisseController");

router.get("/summary", caisseController.getSummary);
router.get("/", caisseController.getAllEntries);
router.post("/", caisseController.createEntry);
router.delete("/:id", caisseController.deleteEntry);

module.exports = router;
