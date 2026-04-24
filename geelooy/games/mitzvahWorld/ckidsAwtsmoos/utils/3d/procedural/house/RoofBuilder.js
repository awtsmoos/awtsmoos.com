
/**
 * B"H
 * @module RoofBuilder
 * @description
 * Forges the pitched roof covering the structure. Uses a 4-sided pyramid (ConeGeometry)
 * rotated perfectly to align with the square base of the walls below.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class RoofBuilder {
    static build(w, h, d) {
        try {
            // A 4-sided cone acts as a perfect pitched roof
            const roofHeight = Math.max(w, d) * 0.4;
            const radius = Math.max(w, d) * 0.8; // Give it a slight overhang
            
            const roof = new THREE.ConeGeometry(radius, roofHeight, 4);
            
            // Rotate 45 degrees so the square base aligns with the X/Z axes
            roof.rotateY(Math.PI / 4);
            
            // Lift it to sit exactly on top of the walls
            roof.translate(0, h + (roofHeight / 2), 0);
            
            return [roof];
        } catch (e) {
            console.error("B\"H - ⚡ RoofBuilder failed to cap the vessel.", e);
            return [];
        }
    }
}
