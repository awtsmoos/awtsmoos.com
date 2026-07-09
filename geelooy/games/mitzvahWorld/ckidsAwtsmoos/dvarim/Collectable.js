// B"H
/**
 * @file Collectable.js
 * @module Collectable
 * 
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE GATHERING OF SPARKS — COLLECTABLE ENTITIES                                  ║
 * ║                                                                                  ║
 * ║  "And he gathered the stones of the place..." (Bereishis 28:11)                  ║
 * ║                                                                                  ║
 * ║  Entities that exist in the world purely to be gathered by the Chossid.          ║
 * ║  Clicking them removes them from the world and adds them to inventory.           ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

import Tzomayach from "../chayim/tzomayach.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class Collectable extends Tzomayach {
    type = "Collectable";
    
    constructor(op, olam) {
        super(op, olam);
        this.interactable = true;
        this.itemId = op.itemId || "generic_item";
        this.itemName = op.itemName || "Item";
        this.itemType = op.itemType || "resource";
        this.amount = op.amount || 1;
        this.meshType = op.meshType || 'box'; // 'box', 'sphere', 'coin'
        this.color = op.color || 0xffff00;
    }

    async heescheel(olam) {
        this.olam = olam;
        
        let geo;
        if (this.meshType === 'sphere' || this.meshType === 'fruit') {
            geo = new THREE.SphereGeometry(0.3, 16, 16);
        } else if (this.meshType === 'coin') {
            geo = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16);
            if(this.rotation) this.rotation.x = Math.PI / 2; // stand it up
        } else {
            geo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        }

        const mat = new THREE.MeshStandardMaterial({ 
            color: this.color,
            emissive: this.color,
            emissiveIntensity: 0.2,
            metalness: this.meshType === 'coin' ? 1.0 : 0.1,
            roughness: this.meshType === 'coin' ? 0.2 : 0.8
        });

        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.name = `Collectable_${this.itemId}_${this.id}`;
        this.mesh.nivraAwtsmoos = this;
        this.mesh.castShadow = true;

        if (this.position) this.mesh.position.copy(this.position.vector3 ? this.position.vector3() : this.position);
        if (this.rotation) this.mesh.rotation.set(this.rotation.x || 0, this.rotation.y || 0, this.rotation.z || 0);

        this.mesh.updateMatrixWorld(true);

        await olam.hoyseef(this);
        if(olam.interactiveOctree) olam.interactiveOctree.fromGraphNode(this.mesh);

        this.isReady = true;

        // Interaction Logic
        this.on("accepted interaction", (chossid) => {
            // B"H: silent

            
            if (chossid && chossid.inventory) {
                // Add to inventory
                chossid.inventory.addItem({
                    id: this.itemId,
                    name: this.itemName,
                    type: this.itemType,
                    amount: this.amount
                });
                
                this.olam.ayshPeula("ui event", "toast", { message: `Collected ${this.itemName}` });
                
                // Remove from world
                this.olam.scene.remove(this.mesh);
                if (this.mesh.geometry) this.mesh.geometry.dispose();
                if (this.mesh.material) this.mesh.material.dispose();
                
                // Unregister
                const idx = this.olam.nivrayim.indexOf(this);
                if(idx > -1) this.olam.nivrayim.splice(idx, 1);
            }
        });

        // Hover Effect
        this.on("gained interaction focus", () => {
             mat.emissiveIntensity = 0.8;
             this.mesh.scale.set(1.2, 1.2, 1.2);
        });
        this.on("lost interaction focus", () => {
             mat.emissiveIntensity = 0.2;
             this.mesh.scale.set(1, 1, 1);
        });
    }

    heesHawvoos(dt) {
        if(this.mesh) {
            // Gentle floating/spinning animation
            this.mesh.rotation.y += dt;
            this.mesh.position.y += Math.sin(Date.now() * 0.005) * 0.001;
        }
    }
}
