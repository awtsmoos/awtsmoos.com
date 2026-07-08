
//B"H
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import ProceduralGenerators from '../../Olam/math/ProceduralGenerators.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class BuildingGenerator {
    static generate(type, options = {}) {
        const geo = new THREE.BoxGeometry(options.width || 1, 1, options.depth || 1);
        const { geometry } = ProceduralGenerators.applyModifiers(geo, options.modifiers);
        const mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: options.color || 0xcccccc }));
        const group = new THREE.Group(); group.add(mesh); return group;
    }
}
