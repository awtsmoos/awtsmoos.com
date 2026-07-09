
// B"H
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class WallCarver {
    static carve(width, height, thickness, holes = []) {
        let pieces = [];
        let currentX = 0;

        if (!holes || !Array.isArray(holes)) holes = [];

        // B"H: Sort holes linearly from left to right along the wall's axis
        holes.sort((a, b) => (a.offset || 0) - (b.offset || 0));

        holes.forEach(hole => {
            const holeWidth = hole.width || 4;
            const holeHeight = hole.height || 5;
            
            // Convert center offset (-W/2 to W/2) into linear X coordinate (0 to W)
            const holeStartX = (width / 2) + (hole.offset || 0) - (holeWidth / 2);
            const holeEndX = holeStartX + holeWidth;

            // 1. Solid Foundation before the doorway
            if (holeStartX > currentX) {
                const w = holeStartX - currentX;
                const box = new THREE.BoxGeometry(w, height, thickness);
                box.translate(currentX + w / 2 - (width / 2), height / 2, 0);
                pieces.push(box);
            }

            // 2. The Lintel (Solid section floating above the doorway)
            const lintelH = height - holeHeight;
            if (lintelH > 0) {
                const box = new THREE.BoxGeometry(holeWidth, lintelH, thickness);
                box.translate(holeStartX + holeWidth / 2 - (width / 2), height - lintelH / 2, 0);
                pieces.push(box);
            }

            currentX = holeEndX;
        });

        // 3. The Remnant: Solid section continuing after the last doorway
        if (currentX < width) {
            const w = width - currentX;
            const box = new THREE.BoxGeometry(w, height, thickness);
            box.translate(currentX + w / 2 - (width / 2), height / 2, 0);
            pieces.push(box);
        }
        
        return pieces;
    }
}
