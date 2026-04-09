const Reclamation = require("../models/Reclamation"); // Adjust the path as needed

// Add a new reclamation
exports.createReclamation = async (req, res) => {
  try {
    const newReclamation = new Reclamation(req.body);
    const savedReclamation = await newReclamation.save();
    res.status(201).json(savedReclamation);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to create reclamation", error: err });
  }
};

// Get all reclamations
exports.getAllReclamations = async (req, res) => {
  try {
    const reclamations = await Reclamation.find().populate("blId userId");
    res.status(200).json(reclamations);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching reclamations", error: err });
  }
};

// Get a specific reclamation by ID
exports.getReclamationById = async (req, res) => {
  try {
    const reclamation = await Reclamation.findById(req.params.id).populate(
      "blId userId"
    );
    if (!reclamation) {
      return res.status(404).json({ message: "Reclamation not found" });
    }
    res.status(200).json(reclamation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching reclamation", error: err });
  }
};


// Fetch reclamations for a specific BL
exports.getReclamationsByBlId = async (req, res) => {
  try {
    // Get the BL ID from the request parameters
    const blId = req.params.blId;
    
    // Find all reclamations where the 'blId' matches the provided ID
    const reclamations = await Reclamation.find({ blId })
      .populate('blId userId'); // Populate associated BL and User details
    
    // If no reclamations are found for the given BL, return a 404 message
    if (!reclamations || reclamations.length === 0) {
      return res.status(404).json({ message: "No reclamations found for this BL" });
    }

    // Return the list of reclamations
    res.status(200).json(reclamations);
  } catch (err) {
    // Catch and handle any errors during the database query
    console.error(err);
    res.status(500).json({ message: "Error fetching reclamations", error: err });
  }
};

// Update a reclamation
exports.updateReclamation = async (req, res) => {
  try {
    const reclamation = await Reclamation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!reclamation) {
      return res.status(404).json({ message: "Reclamation not found" });
    }
    res.status(200).json(reclamation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating reclamation", error: err });
  }
};
// Delete a reclamation
exports.deleteReclamation = async (req, res) => {
  try {
    const reclamation = await Reclamation.findByIdAndDelete(req.params.id);
    if (!reclamation) {
      return res.status(404).json({ message: "Reclamation not found" });
    }
    res.status(200).json({ message: "Reclamation deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting reclamation", error: err });
  }
};