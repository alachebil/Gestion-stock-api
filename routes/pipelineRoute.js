const express = require('express');
const router = express.Router();
const { getPipelines, runPipeline,getPipelineStages, getPipelineBuilding,getPipelineLogs } = require('../controllers/pipeline');


// Route pour récupérer la liste des pipelines
router.get('/get-pipelines', async (req, res) => {
    const result = await getPipelines();
    if (result.success) {
        res.status(200).json(result);
    } else {
        res.status(500).json(result);
    }
});

// Route pour exécuter un pipeline
router.post('/run-pipeline/:pipelineName', async (req, res) => {
    const { pipelineName } = req.params;
    const result = await runPipeline(pipelineName);
    if (result.success) {
        res.status(200).json(result);
    } else {
        res.status(500).json(result);
    }
});


// ✅ Nouvelle route pour récupérer les stages
router.get('/stages/:name', async (req, res) => {
    const result = await getPipelineStages(req.params.name);
    res.status(result.success ? 200 : 500).json(result);
});




// Nouvelle route pour vérifier si un pipeline est en cours d'exécution

 router.get('/building/:pipelineName', async (req, res) => {
const { pipelineName } = req.params;

     try {
         const buildInfo = await getPipelineBuilding(pipelineName);
         res.status(200).json(buildInfo); // Renvoie l'état du pipeline (en cours ou non)
     } catch (error) {
         res.status(500).json({ error: error.message });
     }
 });






// Route pour vérifier si un pipeline est terminé (en cours ou non)
router.get('/status/:pipelineName', async (req, res) => {
    const { pipelineName } = req.params;

    try {
        const buildInfo = await getPipelineBuilding(pipelineName);
        if (!buildInfo.building) {
            // Le pipeline n'est plus en cours, vérifier le résultat
            const result = await jenkinsRequest('GET', `/job/${pipelineName}/${buildInfo.number}/api/json`);
            res.status(200).json({ building: false, result: result.result }); // Résultat de la pipeline
        } else {
            res.status(200).json({ building: true }); // Le pipeline est encore en cours
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Nouvelle route pour récupérer les logs d'un pipeline
router.get('/logs/:pipelineName/:buildNumber', async (req, res) => {
    const { pipelineName, buildNumber } = req.params;
    const result = await getPipelineLogs(pipelineName, buildNumber);
    res.status(result.success ? 200 : 500).json(result);
});


module.exports = router;
