// B"H
/**
 * @file FenceAssembler.js
 * @module FenceAssembler
 * 
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE BOUNDARY OF HOLINESS — PROCEDURAL FENCES & GATES                            ║
 * ║                                                                                  ║
 * ║  "Make a fence around the Torah..." (Pirkei Avot 1:1)                            ║
 * ║                                                                                  ║
 * ║  Generates pure JSON definitions for fences, bypassing THREE.js dependencies.    ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

export default class FenceAssembler {
    /**
     * @param {Object} options 
     * @returns {Object} JSON hierarchy of Nivrayim
     */
    static build(options = {}) {
        // B"H: silent

        
        const width = options.width || 30;
        const depth = options.depth || 30;
        const height = options.height || 2;
        const type = options.type || 'wood';
        const thickness = 0.5;
        const gateWidth = 4;
        const frontSideWidth = (width - gateWidth) / 2;

        let color = "#8b4513";
        if (type === 'hedge') color = "#228b22";
        else if (type === 'stone') color = "#888888";

        const mat = { MeshStandardMaterial: { color: color, roughness: 0.9 } };

        const nivrayim = {};
        const ts = Date.now();

        // Helper to add a wall piece
        const addWall = (name, w, h, d, px, py, pz) => {
            nivrayim[`${name}_${ts}`] = {
                type: "SolidBlock",
                name: name,
                golem: {
                    guf: { BoxGeometry: [w, h, d] },
                    toyr: mat
                },
                position: { x: px, y: py, z: pz },
                isSolid: true
            };
        };

        const cx = options.position?.x || 0;
        const cy = options.position?.y || 0;
        const cz = options.position?.z || 0;

        // Back wall
        addWall("fence_back", width, height, thickness, cx, cy + height/2, cz - depth/2);
        // Left wall
        addWall("fence_left", thickness, height, depth, cx - width/2, cy + height/2, cz);
        // Right wall
        addWall("fence_right", thickness, height, depth, cx + width/2, cy + height/2, cz);
        // Front Left
        addWall("fence_frontL", frontSideWidth, height, thickness, cx - width/2 + frontSideWidth/2, cy + height/2, cz + depth/2);
        // Front Right
        addWall("fence_frontR", frontSideWidth, height, thickness, cx + width/2 - frontSideWidth/2, cy + height/2, cz + depth/2);

        // Gate
        nivrayim[`gate_${ts}`] = {
            type: "InteractiveDoor",
            name: "Property_Gate",
            width: gateWidth,
            height: height,
            thickness: 0.3,
            color: "#5c4033",
            position: { x: cx, y: cy + height/2, z: cz + depth/2 }
        };

        return nivrayim;
    }
}
