const express = require("express");
const router = express.Router();
const blController = require("../controllers/blController"); // Import the BL controller
const reclamationController = require('../controllers/reclamationController'); // Adjust the path as needed
const livraisonController = require('../controllers/livraisonController'); // Adjust the path as needed

// Route to create a new BL
router.post("/", blController.createBL);

// Route to get all BLs
router.get("/", blController.getAllBLs);

// Route to get a specific BL by ID
router.get("/:id", blController.getBLById);

router.get("/ref/:ref", blController.getBlByReference);

// Route to update a BL by ID
router.put("/:ref", blController.updateBL);

// Route to delete a BL by ID
router.delete("/:id", blController.deleteBL);

// Get most frequent article across all BLs
router.get("/most-frequent-article", blController.getMostFrequentArticle);

// Get articles for a specific client, ordered by frequency
router.get("/:codeClient/articles", blController.getArticlesForClient);

// Get weekly estimation of article weights by client
router.get("/weekly-estimation", blController.getWeeklyEstimationByClient);

// Get weekly estimation for a specific client
router.get("/:clientCode/weekly-estimation", blController.getWeeklyEstimationForClient);

// Get a specific reclamation by BL ID
router.get('/:blId/reclamations', reclamationController.getReclamationsByBlId);

// ** Livraison Routes **

// Route to get livraisons by BL ID
router.get("/:blId/livraisons", livraisonController.getLivraisonsByBlId);

module.exports = router;
