// B"H
/**
 * @file PlacementManager.js
 * @module PlacementManager
 * 
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE HAND OF THE BUILDER — WORLD MANIFESTATION                                  ║
 * ║                                                                                  ║
 * ║  "He placed the boundaries of the nations..." (Devarim 32:8)                    ║
 * ║                                                                                  ║
 * ║  This module manages the interactive placement of objects (furniture, bricks,   ║
 * ║  trees) into the physical realm. It projects a ghost image of the item          ║
 * ║  and anchors it to the terrain upon the click of the Chossid.                   ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

import * as THREE from '/games/scripts/build/three.module.js';

export default class PlacementManager {
    constructor(olam) {
        this.olam = olam;
        this.isActive = false;
        this.currentItem = null;
        this.ghostMesh = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2(0, 0); // Center of screen for crosshair placement
        
        // Listeners for mouse/click
        this._onClick = this.onClick.bind(this);
    }

    /**
     * Start placement mode with a specific item from inventory
     */
    startPlacement(itemData) {
        if (!itemData) return;
        this.isActive = true;
        this.currentItem = itemData;
        // B"H: silent


        // Create a ghost mesh
        // For now, we use a generic translucent box, but it could be specific to the item type
        const geo = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.5,
            wireframe: true
        });
        
        // Adjust ghost size based on type
        if (itemData.type === 'furniture' || itemData.id.includes('chair')) {
            geo.scale(1.2, 2, 1.2);
        } else if (itemData.type === 'tree') {
            geo.scale(2, 5, 2);
        }

        this.ghostMesh = new THREE.Mesh(geo, mat);
        this.olam.scene.add(this.ghostMesh);

        this.rotationY = 0;

        this._onWheel = (e) => {
            if (!this.isActive || !this.ghostMesh) return;
            // Scroll to rotate (snap to 45 degree increments for crispness)
            const delta = Math.sign(e.deltaY) * (Math.PI / 4);
            this.rotationY += delta;
            this.ghostMesh.rotation.y = this.rotationY;
        };

        document.addEventListener('mousedown', this._onClick);
        window.addEventListener('wheel', this._onWheel);
        
        // Show instruction UI
        this.olam.ayshPeula("ui event", "toast", { message: `Placing: ${itemData.name}. Click to anchor. Scroll to rotate.` });
    }

    /**
     * Stop placement mode
     */
    stopPlacement() {
        this.isActive = false;
        this.currentItem = null;
        if (this.ghostMesh) {
            this.olam.scene.remove(this.ghostMesh);
            this.ghostMesh.geometry.dispose();
            this.ghostMesh.material.dispose();
            this.ghostMesh = null;
        }
        document.removeEventListener('mousedown', this._onClick);
        window.removeEventListener('wheel', this._onWheel);
    }

    /**
     * Update the ghost mesh position based on camera look direction
     */
    update(dt) {
        if (!this.isActive || !this.ghostMesh || !this.olam.camera) return;

        // Raycast from center of camera (crosshair)
        this.raycaster.setFromCamera(this.mouse, this.olam.camera);

        // Intersect against solid objects in the world (like terrain, floors)
        const solids = [];
        this.olam.scene.traverse(child => {
            if (child.isMesh && child.userData.isSolid && child !== this.ghostMesh) {
                // Don't intersect player
                if (child.name === 'cameraAnchor' || child.name === 'characterModel') return;
                solids.push(child);
            }
        });

        const intersects = this.raycaster.intersectObjects(solids, false);

        if (intersects.length > 0) {
            const hit = intersects[0];
            this.ghostMesh.position.copy(hit.point);
            // Snap to grid or add slight Y offset to prevent z-fighting
            this.ghostMesh.position.y += this.ghostMesh.scale.y / 2; // Assume origin is center
            this.ghostMesh.material.color.setHex(0x00ff00); // Valid placement
        } else {
            // Place it floating in front of camera if no intersection
            this.raycaster.ray.at(5, this.ghostMesh.position);
            this.ghostMesh.material.color.setHex(0xff0000); // Invalid placement
        }
    }

    /**
     * Anchor the object into reality
     */
    onClick(e) {
        // Only trigger on left click
        if (e.button !== 0 || !this.isActive || !this.currentItem) return;

        if (this.ghostMesh.material.color.getHex() === 0xff0000) {
            this.olam.ayshPeula("ui event", "toast", { message: "Cannot place here." });
            return;
        }

        const pos = this.ghostMesh.position.clone();
        
        // Remove item from inventory
        if (this.olam.chossid && this.olam.chossid.inventory) {
            this.olam.chossid.inventory.removeItem(this.currentItem.id);
        }

        // Spawn the actual entity via Olam's component system
        this.spawnEntity(this.currentItem, pos);

        this.olam.ayshPeula("ui event", "toast", { message: `${this.currentItem.name} placed.` });
        
        // Stop placement after one item, or keep going if we want multi-place
        this.stopPlacement();
    }

    /**
     * Transforms the inventory item data into a real physical entity
     */
    spawnEntity(itemData, position) {
        // B"H: silent

        
        let type = "SolidBlock"; // Default
        let options = { 
            position: { x: position.x, y: position.y, z: position.z },
            rotation: { x: 0, y: this.rotationY || 0, z: 0 },
            name: `${itemData.name}_placed_${Date.now()}`
        };

        if (itemData.id.includes("brick")) {
            type = "SolidBlock";
            options.width = 1; options.height = 1; options.depth = 1;
            options.color = itemData.id.includes("gold") ? 0xffd700 : 0xb22222;
        } 
        else if (itemData.id.includes("chair") || itemData.id.includes("table") || itemData.id.includes("couch")) {
            type = "ProceduralFurniture";
            options.furnitureType = itemData.id.split('_')[0]; // naive parsing
        }
        else if (itemData.id.includes("tree") || itemData.type === "tree") {
            type = "ProceduralTree";
            options.preset = "Oak Medium";
        }
        else if (itemData.id.includes("wood")) {
            type = "SolidBlock";
            options.width = 2; options.height = 0.2; options.depth = 4;
            options.color = 0x8b4513; // Brown wood color
        }

        // Delegate to Olam's entity creation flow
        if (typeof this.olam.addObject === "function") {
             this.olam.addObject(type, options).then((nivra) => {
                 // B"H: silent

             });
        }
    }
}
