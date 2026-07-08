// B"H
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class SpecializedFactory {
    static create(instruction) {
        switch (instruction.type) {
            case 'carvedWall':
                return this.generateCarvedWall(instruction);
            case 'stairs':
                return this.generateStairs(instruction);
            case 'roof':
                return this.generateRoof(instruction);
            default:
                return null;
        }
    }

    static generateCarvedWall(instruction) {
        const { width, height, thickness, holes } = instruction;
        let pieces = [];
        let currentX = 0;
        
        let sortedHoles = [...(holes || [])].sort((a, b) => (a.offset || 0) - (b.offset || 0));

        sortedHoles.forEach(hole => {
            const hW = hole.width || 4;
            const hH = hole.height || 5;
            const holeStartX = (width / 2) + (hole.offset || 0) - (hW / 2);
            
            if (holeStartX > currentX) {
                const w = holeStartX - currentX;
                const box = new THREE.BoxGeometry(w, height, thickness);
                box.translate(currentX + w / 2 - (width / 2), height / 2, 0);
                pieces.push(box);
            }

            const lintelH = height - hH;
            if (lintelH > 0) {
                const box = new THREE.BoxGeometry(hW, lintelH, thickness);
                box.translate(holeStartX + hW / 2 - (width / 2), height - lintelH / 2, 0);
                pieces.push(box);
            }
            currentX = holeStartX + hW;
        });

        if (currentX < width) {
            const w = width - currentX;
            const box = new THREE.BoxGeometry(w, height, thickness);
            box.translate(currentX + w / 2 - (width / 2), height / 2, 0);
            pieces.push(box);
        }
        
        return pieces.length > 0 ? BufferGeometryUtils.mergeGeometries(pieces, false) : new THREE.BoxGeometry(0.1, 0.1, 0.1);
    }

    static generateStairs(instruction) {
        const { width, numSteps, stepHeight, stepDepth } = instruction;
        let pieces = [];
        for (let i = 0; i < numSteps; i++) {
            const currentWidth = width + (i * (instruction.flare || 0.5));
            const geo = new THREE.BoxGeometry(currentWidth, stepHeight, stepDepth);
            geo.translate(0, -i * stepHeight, (i * stepDepth) + (stepDepth / 2));
            pieces.push(geo);
        }
        return pieces.length > 0 ? BufferGeometryUtils.mergeGeometries(pieces, false) : new THREE.BoxGeometry(0.1, 0.1, 0.1);
    }

    static generateRoof(instruction) {
        const { width, depth, peakHeight, overhang } = instruction;
        const w = width + (overhang || 0) * 2;
        const d = depth + (overhang || 0) * 2;
        
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(w / 2, peakHeight);
        shape.lineTo(w, 0);
        shape.lineTo(0, 0);

        const extrudeSettings = { depth: d, bevelEnabled: false };
        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        
        geo.translate(-w / 2, 0, -d / 2);
        return geo;
    }
}
