const express = require("express");
const router = express.Router();
const livraisonController = require("../controllers/livraisonController"); // Adjust the path as needed

// Create a new livraison
router.post("/", livraisonController.createLivraison);

// Get all livraisons
router.get("/", livraisonController.getAllLivraisons);

// Get a specific livraison by ID
router.get("/:id", livraisonController.getLivraisonById);

// Update a livraison by ID
router.put("/:id", livraisonController.updateLivraison);

// Delete a livraison by ID
router.delete("/:id", livraisonController.deleteLivraison);

module.exports = router;
