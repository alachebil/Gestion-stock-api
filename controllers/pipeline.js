const axios = require('axios');
require('dotenv').config();

const JENKINS_URL = process.env.JENKINS_URL;
const JENKINS_USER = process.env.JENKINS_USER;
const JENKINS_TOKEN = process.env.JENKINS_TOKEN;

const jenkinsRequest = async (method, url, data = null) => {
    try {
        const response = await axios({
            method,
            url: `${JENKINS_URL}${url}`,
            auth: {
                username: JENKINS_USER,
                password: JENKINS_TOKEN,
            },
            data,
        });
        return response.data;
    } catch (error) {
        console.error('Erreur API Jenkins:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// Fonction pour récupérer la liste des pipelines avec date de dernier build
const getPipelines = async () => {
    try {
        const pipelines = await jenkinsRequest('GET', '/api/json?tree=jobs[name,url,lastBuild[timestamp]]');
        const data = pipelines.jobs.map(job => ({
            name: job.name,
            url: job.url,
            lastExecution: job.lastBuild ? new Date(job.lastBuild.timestamp).toISOString() : null
        }));
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Échec de la récupération des pipelines' };
    }
};


  

const getPipelineStages = async (pipelineName) => {
    try {
        // Récupérer le dernier build number
        const lastBuildInfo = await jenkinsRequest('GET', `/job/${pipelineName}/lastBuild/api/json`);

if (!lastBuildInfo.building) {
  // Attendre que le build démarre si ce n'est pas en cours
  throw new Error("Aucun build en cours actuellement.");
}

const buildNumber = lastBuildInfo.number;

        // Récupérer les stages du build
        const stagesData = await jenkinsRequest('GET', `/job/${pipelineName}/${buildNumber}/wfapi/describe`);
        const stages = stagesData.stages.map(stage => ({
            name: stage.name,
            status: stage.status,
            startTimeMillis: stage.startTimeMillis,
            durationMillis: stage.durationMillis
        }));

        return { success: true, data: stages };
    } catch (error) {
        return { success: false, error: "Erreur lors de la récupération des étapes du pipeline." };
    }
};




// Fonction pour exécuter un pipeline
const runPipeline = async (pipelineName) => {
    try {
        const result = await jenkinsRequest('POST', `/job/${pipelineName}/build`);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: 'Échec de l\'exécution du pipeline' };
    }
};



const getPipelineBuilding = async (pipelineName) => {
    try {
        const buildInfo = await jenkinsRequest('GET', `/job/${pipelineName}/lastBuild/api/json`);
        return { building: buildInfo.building, number: buildInfo.number };
    } catch (error) {
        return { building: false, error: 'Erreur récupération état du pipeline' };
    }
};



// Fonction pour récupérer les logs d'un pipeline
const getPipelineLogs = async (pipelineName, buildNumber) => {
    try {
        // Récupérer les logs du build
        const logs = await jenkinsRequest('GET', `/job/${pipelineName}/${buildNumber}/consoleText`);
        return { success: true, data: logs };
    } catch (error) {
        return { success: false, error: 'Erreur lors de la récupération des logs du pipeline.' };
    }
};

module.exports = {
    getPipelines,
    runPipeline,
    getPipelineStages,
    getPipelineBuilding,
    getPipelineLogs,
};
