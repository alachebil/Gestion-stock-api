const BL = require("../models/BL"); // Import the BL model

// Create a new BL
exports.createBL = async (req, res) => {
  try {
    const newBL = new BL(req.body); // Create a new BL document with the provided body data
    await newBL.save();
    res.status(201).json({ message: "BL created successfully", data: newBL });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all BLs
exports.getAllBLs = async (req, res) => {
  try {
    const bls = await BL.find(); // Fetch all BL documents
    res.status(200).json(bls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific BL by ID
exports.getBLById = async (req, res) => {
  try {
    const bl = await BL.findById(req.params.id); // Find a BL document by its ID
    if (!bl) {
      return res.status(404).json({ message: "BL not found" });
    }
    res.status(200).json(bl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a BL by ID
exports.updateBL = async (req, res) => {
  try {
    const updatedBL = await BL.findOneAndUpdate(
      { ref: req.params.ref }, // Find by the 'ref' field
      req.body
    );

    if (!updatedBL) {
      return res.status(404).json({ message: "BL not found" });
    }

    res
      .status(200)
      .json({ message: "BL updated successfully", data: updatedBL });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a BL by ID
exports.deleteBL = async (req, res) => {
  try {
    const deletedBL = await BL.findByIdAndDelete(req.params.id); // Delete a BL by its ID
    if (!deletedBL) {
      return res.status(404).json({ message: "BL not found" });
    }
    res.status(200).json({ message: "BL deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a BL by reference
exports.getBlByReference = async (req, res) => {
  const { ref } = req.params;

  try {
    const bl = await BL.findOne({ ref });

    if (!bl) {
      return res.status(404).json({ message: "Bon Livraison not found" });
    }

    res.status(200).json(bl);
  } catch (error) {
    console.error("Error fetching BL by reference: ", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Get the most frequent article across all BLs
exports.getMostFrequentArticle = async (req, res) => {
  try {
    const bls = await BL.find(); // Fetch all BLs
    const articleCount = {};

    bls.forEach(bl => {
      bl.articleScan.forEach(article => {
        const articleReferance = article.referance; // Using 'referance' instead of 'code'
        if (articleReferance) {
          articleCount[articleReferance] = (articleCount[articleReferance] || 0) + 1;
        }
      });
    });

    // Find the article with the highest count
    let mostFrequentArticle = null;
    let maxCount = 0;
    Object.keys(articleCount).forEach(article => {
      if (articleCount[article] > maxCount) {
        mostFrequentArticle = article;
        maxCount = articleCount[article];
      }
    });

    res.status(200).json({
      message: `Most Frequent Article: ${mostFrequentArticle} (Count: ${maxCount})`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// Get articles for a specific client, ordered by frequency
exports.getArticlesForClient = async (req, res) => {
  const { codeClient } = req.params;

  try {
    const bls = await BL.find({ codeClient }); // Fetch all BLs for the client
    const articleCount = {};

    bls.forEach(bl => {
      bl.articleScan.forEach(article => {
        const articleReferance = article.referance; // Using 'referance' instead of 'code'
        if (articleReferance) {
          articleCount[articleReferance] = (articleCount[articleReferance] || 0) + 1;
        }
      });
    });

    // Sort articles by frequency (most frequent first)
    const sortedArticles = Object.entries(articleCount)
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [article, count]) => {
        acc[article] = count;
        return acc;
      }, {});

    res.status(200).json(sortedArticles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get the week number from a date
function getWeekNumber(date) {
  const tempDate = new Date(date);
  tempDate.setHours(0, 0, 0, 0);
  tempDate.setDate(tempDate.getDate() + 6 - (tempDate.getDay() || 7));
  return Math.ceil((((tempDate - new Date(tempDate.getFullYear(), 0, 1)) / 86400000) + 1) / 7);
}

// Get weekly estimation by client
exports.getWeeklyEstimationByClient = async (req, res) => {
  try {
    const bls = await BL.find(); // Fetch all BLs
    const estimation = {};

    bls.forEach(bl => {
      const { codeClient, dateChauffeur, articleScan } = bl;
      const weekNumber = getWeekNumber(dateChauffeur); // Get the week number using helper function

      if (!estimation[codeClient]) {
        estimation[codeClient] = {};
      }
      if (!estimation[codeClient][weekNumber]) {
        estimation[codeClient][weekNumber] = {};
      }

      articleScan.forEach(article => {
        const articleReferance = article.referance; // Using 'referance' instead of 'code'
        const poids = parseFloat(article.poids); // Using 'poids' for weight, assuming it's a string that needs parsing

        if (poids) {
          if (!estimation[codeClient][weekNumber][articleReferance]) {
            estimation[codeClient][weekNumber][articleReferance] = 0;
          }

          estimation[codeClient][weekNumber][articleReferance] += poids;
        }
      });
    });

    res.status(200).json(estimation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get weekly estimation for a specific client
exports.getWeeklyEstimationForClient = async (req, res) => {
  const { clientCode } = req.params;

  try {
    const bls = await BL.find({ codeClient: clientCode }); // Fetch all BLs for the client
    const estimation = {};

    bls.forEach(bl => {
      const { dateChauffeur, articleScan } = bl;
      const weekNumber = getWeekNumber(dateChauffeur); // Get the week number using helper function

      if (!estimation[weekNumber]) {
        estimation[weekNumber] = {};
      }

      articleScan.forEach(article => {
        const articleReferance = article.referance; // Using 'referance' instead of 'code'
        const poids = parseFloat(article.poids); // Using 'poids' for weight

        if (poids) {
          if (!estimation[weekNumber][articleReferance]) {
            estimation[weekNumber][articleReferance] = 0;
          }

          estimation[weekNumber][articleReferance] += poids;
        }
      });
    });

    res.status(200).json(estimation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
