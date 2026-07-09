
/**
 * B"H
 * @module Labyrinth
 * @description
 * "Lead me in Your truth and teach me."
 * Generates an interconnected network of walls forming a massive maze.
 * Built into a single geometry for immense performance.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class Labyrinth {
    /**
     * @function generate
     * @description Merges hundreds of walls into a unified structure.
     * @param {number} gridSize - How many cells across the maze is.
     * @param {number} cellSize - The width of each corridor.
     * @param {number} wallHeight - How tall the walls are.
     * @param {number} wallThickness - How thick the barriers are.
     * @returns {THREE.BufferGeometry}
     */
    static generate(gridSize = 10, cellSize = 10, wallHeight = 8, wallThickness = 1) {
        const geoms = [];
        
        for(let x = 0; x < gridSize; x++) {
            for(let z = 0; z < gridSize; z++) {
                const cx = (x - gridSize / 2) * cellSize;
                const cz = (z - gridSize / 2) * cellSize;
                
                // Randomly spawn North Wall
                if(Math.random() > 0.4) {
                    const nWall = new THREE.BoxGeometry(cellSize + wallThickness, wallHeight, wallThickness);
                    nWall.translate(cx, wallHeight / 2, cz - cellSize / 2);
                    geoms.push(nWall);
                }
                
                // Randomly spawn West Wall
                if(Math.random() > 0.4) {
                    const wWall = new THREE.BoxGeometry(wallThickness, wallHeight, cellSize + wallThickness);
                    wWall.translate(cx - cellSize / 2, wallHeight / 2, cz);
                    geoms.push(wWall);
                }
            }
        }

        if(geoms.length === 0) return new THREE.BoxGeometry(1, 1, 1);
        
        const merged = BufferGeometryUtils.mergeGeometries(geoms);
        merged.computeBoundingBox();
        return merged;
    }
}
