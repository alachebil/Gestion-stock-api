require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var connectDB = require("./config");
var usersRouter = require("./routes/users");
const factureRoutes = require("./routes/factureRoutes");
const reclamationRoutes = require("./routes/reclamationRoutes");

const proxmoxRoutes = require("./routes/proxmoxRoutes"); // Importer les routes Proxmox
const pipelineRoute = require("./routes/pipelineRoute");
const stockRoutes = require("./routes/stockRoutes");
const serviceStockRoutes = require("./routes/serviceStockRoutes");
const serviceFactureRoutes = require("./routes/serviceFactureRoutes");
const caisseRoutes = require("./routes/caisseRoutes");
const cors = require("cors");
var app = express();
const allowedOrigins = [process.env.DNS];
app.use(
  cors({
    origin: allowedOrigins,
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
  })
);
connectDB();

app.use(logger("dev"));
app.use(express.json({ limit: "2gb" }));
app.use(express.urlencoded({ limit: "2gb", extended: true }));
app.use(cookieParser());
app.use("/facture", factureRoutes);
app.use("/users", usersRouter);
app.use("/reclamation", reclamationRoutes);
app.use("/pipeline", pipelineRoute);

// Routes Proxmox
app.use("/proxmox", proxmoxRoutes); // Ajouter les routes Proxmox
app.use("/stock", stockRoutes);
app.use("/service-stock", serviceStockRoutes);
app.use("/service-facture", serviceFactureRoutes);
app.use("/caisse", caisseRoutes);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.json("error");
});

module.exports = app;
