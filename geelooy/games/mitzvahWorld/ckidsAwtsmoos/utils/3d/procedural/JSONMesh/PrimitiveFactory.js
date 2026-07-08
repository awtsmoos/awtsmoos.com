// B"H
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class PrimitiveFactory {
    static create(instruction) {
        switch (instruction.type) {
            case 'box':
                return new THREE.BoxGeometry(instruction.width || 1, instruction.height || 1, instruction.depth || 1);
            case 'plane':
                return new THREE.PlaneGeometry(instruction.width || 1, instruction.height || 1);
            case 'cylinder':
                return new THREE.CylinderGeometry(
                    instruction.radiusTop ?? 0.5, 
                    instruction.radiusBottom ?? 0.5, 
                    instruction.height || 1, 
                    instruction.radialSegments || 8
                );
            case 'sphere':
                return new THREE.SphereGeometry(instruction.radius || 0.5, instruction.widthSegments || 8, instruction.heightSegments || 6);
            case 'torus':
                return new THREE.TorusGeometry(instruction.radius || 0.5, instruction.tube || 0.2, instruction.radialSegments || 8, instruction.tubularSegments || 6);
            default:
                return null;
        }
    }
}
