const Livraison = require("../models/Livraison"); // Adjust the path as needed

// Create a new livraison
exports.createLivraison = async (req, res) => {
  try {
    const livraison = new Livraison({
      dateLivraisonClient: req.body.dateLivraisonClient,
      etatLivraison: req.body.etatLivraison,
      confirmation: req.body.confirmation,
      blId: req.body.blId,
      userId: req.body.userId,
    });

    const savedLivraison = await livraison.save();
    res.status(201).json(savedLivraison);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating livraison", error: err });
  }
};

// Get all livraisons
exports.getAllLivraisons = async (req, res) => {
  try {
    const livraisons = await Livraison.find();
    res.status(200).json(livraisons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching livraisons", error: err });
  }
};

// Get a specific livraison by ID
exports.getLivraisonById = async (req, res) => {
  try {
    const livraison = await Livraison.findById(req.params.id);
    if (!livraison) {
      return res.status(404).json({ message: "Livraison not found" });
    }
    res.status(200).json(livraison);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching livraison", error: err });
  }
};

// Update a livraison
exports.updateLivraison = async (req, res) => {
  try {
    const livraison = await Livraison.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!livraison) {
      return res.status(404).json({ message: "Livraison not found" });
    }
    res.status(200).json(livraison);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating livraison", error: err });
  }
};

// Delete a livraison
exports.deleteLivraison = async (req, res) => {
  try {
    const livraison = await Livraison.findByIdAndDelete(req.params.id);
    if (!livraison) {
      return res.status(404).json({ message: "Livraison not found" });
    }
    res.status(200).json({ message: "Livraison deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting livraison", error: err });
  }
};


// Get livraisons by BL ID
exports.getLivraisonsByBlId = async (req, res) => {
  try {
    const livraisons = await Livraison.find({ blId: req.params.blId }).populate("userId", "name");
    if (!livraisons.length) {
      return res.status(404).json({ message: "No livraisons found for the given BL ID" });
    }
    res.status(200).json(livraisons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching livraisons by BL ID", error: err });
  }
};
