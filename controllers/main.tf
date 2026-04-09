terraform {
  required_providers {
    proxmox = {
      source  = "telmate/proxmox"
      version = "2.9.11" # Version du provider Proxmox
    }
  }
}

provider "proxmox" {
  pm_api_url      = "https://192.168.242.130:8006/api2/json" # URL de l'API Proxmox
  pm_user         = "root@pam" # Utilisateur Proxmox
  pm_password     = "alachebil" # Mot de passe ou token secret
  pm_tls_insecure = true # Ignorer la vérification SSL (pour les certificats auto-signés)
}

resource "proxmox_vm_qemu" "vm" {
  name        = "terraform-vm-${count.index + 1}"
  target_node = "pve" # Nœud Proxmox
  clone       = "template" # Nom du template à cloner
  cores       = 2
  memory      = 2048
  sockets     = 1
  disk {
    size    = "5G"
    storage = "local-lvm"
    type    = "scsi"
  }
  network {
    model  = "virtio"
    bridge = "vmbr0"
  }
  count = 1 # Nombre de VMs à créer
}