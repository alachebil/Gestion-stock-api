const express = require('express');
const router = express.Router();
const reclamationController = require('../controllers/reclamationController'); // Adjust the path as needed

// Create a new reclamation
router.post('/', reclamationController.createReclamation);

// Get all reclamations
router.get('/', reclamationController.getAllReclamations);

// Get a specific reclamation by ID
router.get('/:id', reclamationController.getReclamationById);

// Update a reclamation by ID
router.put('/:id', reclamationController.updateReclamation);

// Delete a reclamation by ID
router.delete('/:id', reclamationController.deleteReclamation);

module.exports = router;
