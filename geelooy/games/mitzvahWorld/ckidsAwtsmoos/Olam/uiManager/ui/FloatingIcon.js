/**
 * B"H
 * @file FloatingIcon.js
 * @description
 * 💡 THE SIGN OF THE MISSION 💡
 * 
 * Chapter 31: The Visible Signal.
 * "A sign for a good thing."
 * 
 * This class handles the floating "!" and "?" icons above NPCs.
 * It uses a Sprite in Three.js to ensure the icon always faces the player.
 */

import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class FloatingIcon {
    constructor(parentEntity) {
        this.parentEntity = parentEntity;
        this.olam = parentEntity.olam;
        this.sprite = null;
        this.state = "none"; // none, available (! gold), in_progress (? silver), complete (? gold)
    }

    /**
     * B"H: Update the icon state.
     */
    setState(state) {
        if (this.state === state) return;
        this.state = state;
        this.refresh();
    }

    refresh() {
        if (this.sprite) {
            this.parentEntity.mesh.remove(this.sprite);
            this.sprite.geometry.dispose();
            this.sprite.material.dispose();
            this.sprite = null;
        }

        if (this.state === "none") return;

        const char = this.state === "available" ? "!" : "?";
        const color = (this.state === "in_progress") ? "#c0c0c0" : "#ffd700";

        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = color;
        ctx.font = "bold 100px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "black";
        ctx.shadowBlur = 10;
        ctx.fillText(char, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        this.sprite = new THREE.Sprite(material);
        
        // Position it above the NPC's head
        this.sprite.position.y = 2.5; 
        this.sprite.scale.set(1.5, 1.5, 1.5);
        
        this.parentEntity.mesh.add(this.sprite);
    }

    update(dt) {
        if (this.sprite) {
            // Floating animation
            this.sprite.position.y = 2.5 + Math.sin(Date.now() * 0.005) * 0.1;
        }
    }
}
