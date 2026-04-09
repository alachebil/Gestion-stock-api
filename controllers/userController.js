const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  const { email, name, lastName, phone, password, image } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "L'utilisateur existe déjà" });
    }

    const newUser = new User({ email, name, lastName, phone, password, image });
    await newUser.save();

    res.status(201).json({
      message: "Utilisateur enregistré avec succès",
      user: {
        email: newUser.email,
        name: newUser.name,
        lastName: newUser.lastName,
        phone: newUser.phone,
        image: newUser.image,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur du serveur", error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      user,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur du serveur", error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  const { name, lastName, phone, password, image } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    user.name = name || user.name;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;

    if (password) {
      user.password = password;
    }

    if (image) {
      user.image = image;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Utilisateur mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur du serveur", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur du serveur", error: error.message });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "Aucun utilisateur trouvé" });
    }

    res.status(200).json({ users });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur du serveur", error: error.message });
  }
};

exports.toggleUserRole = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "user") {
      user.role = "responsable";
    } else if (user.role === "responsable") {
      user.role = "user";
    } else {
      return res.status(400).json({
        message: "Only 'user' and 'responsable' roles can be toggled.",
      });
    }

    await user.save();

    res.status(200).json({
      message: `User role updated successfully to ${user.role}.`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
