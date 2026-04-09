const axios = require('axios');
require('dotenv').config();

const PROXMOX_HOST = process.env.PROXMOX_HOST;
const PROXMOX_TOKEN_ID = process.env.PROXMOX_TOKEN_ID;
const PROXMOX_TOKEN_SECRET = process.env.PROXMOX_TOKEN_SECRET;

const proxmoxRequest = async (method, url, data = null) => {
    try {
        const response = await axios({
            method,
            url: `${PROXMOX_HOST}${url}`,
            headers: {
                Authorization: `PVEAPIToken=${PROXMOX_TOKEN_ID}=${PROXMOX_TOKEN_SECRET}`,
            },
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }), // Ignorer la vérification SSL
            data,
        });
        return response.data;
    } catch (error) {
        console.error('Erreur API Proxmox:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// Fonction pour récupérer la liste des VMs
const getVMs = async (node) => {
    try {
        const vms = await proxmoxRequest('GET', `/api2/json/nodes/${node}/qemu`);
        return { success: true, data: vms.data };
    } catch (error) {
        return { success: false, error: 'Échec de la récupération des VMs' };
    }
};



// Fonction pour exécuter Terraform
const createVMWithTerraform = async (vmName, cores, memory, storage) => {
    return new Promise((resolve, reject) => {
        const terraformPath = path.join(__dirname, '../terraform');
        const command = `terraform apply -auto-approve -var "vm_name=${vmName}" -var "cores=${cores}" -var "memory=${memory}" -var "storage=${storage}"`;

        exec(command, { cwd: terraformPath }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Erreur: ${stderr}`);
                reject({ success: false, error: stderr });
            } else {
                console.log(`Sortie: ${stdout}`);
                resolve({ success: true, output: stdout });
            }
        });
    });
};



// Fonction pour récupérer les statistiques de la VM
const getVMStats = async (node, vmid) => {
    try {
        const stats = await proxmoxRequest('GET', `/api2/json/nodes/${node}/qemu/${vmid}/status/current`);
        return { success: true, data: stats.data };
    } catch (error) {
        console.error('Erreur API Proxmox:', error.response ? error.response.data : error.message);
        return { success: false, error: 'Échec de la récupération des statistiques de la VM' };
    }
};




// Exporter les fonctions
module.exports = {
    createVM: async (node, vmid, name, memory, cores, storage) => {
        try {
            const createResponse = await proxmoxRequest('POST', `/api2/json/nodes/${node}/qemu`, {
                vmid,
                name,
                memory,
                cores,
                storage,
            });
            return { success: true, data: createResponse };
        } catch (error) {
            return { success: false, error: 'Échec de la création de la VM' };
        }
    },
    deleteVM: async (node, vmid) => {
        try {
            const deleteResponse = await proxmoxRequest('DELETE', `/api2/json/nodes/${node}/qemu/${vmid}`);
            return { success: true, data: deleteResponse };
        } catch (error) {
            return { success: false, error: 'Échec de la suppression de la VM' };
        }
    },
    getVMs, // Exporter la nouvelle fonction

    createVMWithTerraform,
    getVMStats,
};