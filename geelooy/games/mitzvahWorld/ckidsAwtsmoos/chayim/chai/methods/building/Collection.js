
/**
 * B"H
 * @module Collection
 * @description
 * THE REDEMPTION OF SPARKS (BIRUR)
 * 
 * "And he gathered the scattered ones..."
 * This module allows the soul to reclaim blocks from the world, 
 * returning them to the Treasury (Inventory) for later use.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default {
    async collectObject() {
        const origin = this.getRayStart();
        const direction = this.getRayDirection();
        const ray = new THREE.Ray(origin, direction);
        
        const hit = this.olam.worldOctree.rayIntersect(ray);
        if (!hit || hit.distance > 15) return false;

        // B"H: silent


        const physicsObject = hit.object;
        let visualObject = physicsObject;

        if (physicsObject.userData && physicsObject.userData.visualReference) {
            visualObject = physicsObject.userData.visualReference;
        }

        let tempObj = visualObject;
        while(tempObj && tempObj !== this.olam.nivrayimGroup) {
            if(tempObj.userData && (tempObj.userData.itemData || tempObj.userData.isSolid)) {
                visualObject = tempObj; 
                break;
            }
            tempObj = tempObj.parent;
        }

        if (visualObject.userData?.itemData?.id === "world_brick") return false;

        let itemData;
        if (visualObject.nivraAwtsmoos && typeof visualObject.nivraAwtsmoos.serialize === 'function') {
             itemData = visualObject.nivraAwtsmoos.serialize().itemData || visualObject.userData.itemData || {};
        } else {
             itemData = visualObject.userData?.itemData || { id: "recovered_block", className: "Brick", name: "Recovered Block", quantity: 1 };
        }

        this.spawnHebrewParticles(visualObject.position); 
        this.inventory.addItem(itemData, 1);
        
        this.olam.worldOctree.removeMesh(physicsObject); 
        if (visualObject.nivraAwtsmoos) this.olam.sealayk(visualObject.nivraAwtsmoos);
        else visualObject.removeFromParent();
        
        this.playSound("awtsmoos://dingSound", { volume: 0.5 });
        return true;
    }
};
