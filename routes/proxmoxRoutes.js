const express = require("express");
const router = express.Router();
const { createVM, deleteVM,getVMs,getVMStats } = require("../controllers/Proxmox");


// Route pour créer une VM
router.post("/create-vm", async (req, res) => {
    const { node, vmid, name, memory, cores, storage } = req.body;
    const result = await createVM(node, vmid, name, memory, cores, storage);
    if (result.success) {
        res.status(201).json(result);
    } else {
        res.status(500).json(result);
    }
});

// Route pour supprimer une VM
router.delete("/delete-vm/:node/:vmid", async (req, res) => {
    const { node, vmid } = req.params;
    const result = await deleteVM(node, vmid);
    if (result.success) {
        res.status(200).json(result);
    } else {
        res.status(500).json(result);
    }
});


// Route pour récupérer la liste des VMs
router.get("/get-vms/:node", async (req, res) => {
    const { node } = req.params;
    const result = await getVMs(node);
    if (result.success) {
        res.status(200).json(result);
    } else {
        res.status(500).json(result);
    }
});


// Route pour créer une VM avec Terraform
router.post("/create-vm-terraform", async (req, res) => {
    const { vmName, cores, memory, storage } = req.body;

    try {
        const result = await createVMWithTerraform(vmName, cores, memory, storage);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Route pour récupérer les statistiques d'une VM
// router.get("/get-vm-stats/:node/:vmid", async (req, res) => {
//     const { node, vmid } = req.params;
//     const result = await getVMStats(node, vmid);
//     if (result.success) {
//         res.status(200).json(result);
//     } else {
//         res.status(500).json(result);
//     }
// });



router.get("/get-vm-stats/:node/:vmid", async (req, res) => {
    const { node, vmid } = req.params;
    const result = await getVMStats(node, vmid);
    if (result.success) {
        res.status(200).json(result);
    } else {
        res.status(500).json(result);
    }
});

router.get("/get-vm-stats/:node/:vmid", async (req, res) => {
    const { node, vmid } = req.params;    
    try {
      // Récupérer les stats actuelles
      const currentStats = await getVMStats(node, vmid);     
      // Récupérer les stats historiques (vous devez implémenter cette fonction)
      const history = await getVMStatsHistory(node, vmid);      
      res.status(200).json({
        success: true,
        data: {
          current: currentStats,
          history: {
            cpu: history.map(item => item.cpu),
            mem: history.map(item => item.mem),
            netin: history.map(item => item.netin),
            netout: history.map(item => item.netout),
            timestamps: history.map(item => item.timestamp)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Erreur lors de la récupération des statistiques"
      });
    }
  });

  

module.exports = router;