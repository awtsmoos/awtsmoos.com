
/**
 * B"H
 * @module Placement
 * @description
 * THE ANCHORING OF LIGHT (MISHKAN)
 * 
 * "And they shall make for Me a sanctuary..."
 * This module handles the actual transition of a block from 
 * potential (ghost) to actual (world object).
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    async placeObject() {
        if (!this.activeObject || !this.activeObject.mesh) return;

        const activeItem = this.getActiveItem(); 
        if (!activeItem || !activeItem.isBuildable) return; 

        // B"H: silent

        
        const itemData = activeItem; 
        const mesh = this.activeObject.mesh;
        mesh.updateMatrixWorld(true);
        
        const worldPosition = new THREE.Vector3();
        const worldQuaternion = new THREE.Quaternion();
        const worldScale = new THREE.Vector3();
        mesh.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale);
        const worldRotation = new THREE.Euler().setFromQuaternion(worldQuaternion);

        this.inventory.consumeItem(activeItem, 1);

        if (activeItem.className === "CustomNpc") {
            await this.olam.loadNivrayim({
                CustomNpc: [{ ...itemData, position: worldPosition, rotation: worldRotation, isSolid: false }]
            });
        } else if (activeItem.className === "ProceduralTree") {
            await this.olam.loadNivrayim({
                ProceduralTree: [{ ...itemData, position: worldPosition, rotation: worldRotation, scale: worldScale, isSolid: true }]
            });
        } else {
            const type = itemData.className || 'Domem';
            await this.olam.addObject(type, {
                position: worldPosition,
                scale: worldScale,
                rotation: worldRotation,
                golem: mesh.awtsmoosGolem, 
                itemData, 
                ...(itemData.dimensions ? { dimensions: itemData.dimensions } : {}),
                isSolid: true,
                interactable: true,
                name: "BH_permanent_block_" + Date.now()
            });
        }
        
        this.spawnHebrewParticles(worldPosition);
        this.playSound("awtsmoos://placeSound", { volume: 0.5 });

        if (!this.getActiveItem()) {
            this.removeRay();
        } else {
            this.removeActiveObject(); 
            this.placeBlockOnRay();
        }
    }
};
