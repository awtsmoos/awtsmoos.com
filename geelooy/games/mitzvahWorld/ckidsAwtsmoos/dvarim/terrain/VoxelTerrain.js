//B"H
import Domem from "../../chayim/domem.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class VoxelTerrain extends Domem {
    chunks = {};
    constructor(op, olam) { super(op, olam); this.material = new THREE.MeshLambertMaterial({ color: 0x885533 }); }
    async heescheel(olam) {
        this.olam = olam; this.mesh = new THREE.Group();
        for(let x=-1; x<=1; x++) for(let z=-1; z<=1; z++) this.generateChunk(x, 0, z);
        await olam.hoyseef(this);
    }
    generateChunk(cx, cy, cz) {
        const key = `${cx},${cy},${cz}`;
        const data = new Uint8Array(16*16*16).fill(1);
        const geo = new THREE.BoxGeometry(16, 16, 16);
        const mesh = new THREE.Mesh(geo, this.material);
        mesh.position.set(cx*16, cy*16, cz*16);
        mesh.userData.isSolid = true; mesh.userData.isTerrain = true;
        this.chunks[key] = { data, mesh }; this.mesh.add(mesh);
        this.olam.worldOctree.addObject(mesh);
    }
}