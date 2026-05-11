
/**
 * @file proceduralTree.js
 * @description
 * 🌳 CHAPTER 0: THE TREE IN THE GARDEN 🌳
 */

import Domem from "../../chayim/domem/index.js";
import { getFactory } from "./procedural/materials/registry/index.js";
import MaterialManager from "../../chayim/math/MaterialManager.js";
import TreeGeometry from "./tree/TreeGeometry.js";
import * as THREE from '/games/scripts/build/three.module.js';

export default class ProceduralTree extends Domem {
    constructor(op, olam) {
        super(op, olam);
        this.name = op.name || "Tree_" + Math.random();
        this._trunkH = 8 + Math.random() * 4;
        this._trunkR = 0.5 + Math.random() * 0.3;
        this._leafSz = 4 + Math.random() * 2;
    }

    async heescheel(olam) {
        this.olam = olam;
        this.treeGroup = new THREE.Group();
        console.log(`B"H - 🌳 [ProceduralTree] Manifesting ${this.name}...`);

        const { branchGeos, leafGeos } = TreeGeometry.generate(this._trunkH, this._trunkR, this._leafSz, this._trunkH * 0.5);

        // 1. TRUNK
        const barkFact = getFactory('bark');
        const barkData = await barkFact(olam);
        barkData.properties.color = 0xffffff;
        this._barkMat = MaterialManager.create('Standard', barkData.properties, barkData.snippets);
        const trunkMesh = new THREE.Mesh(this.mergeGeometries(branchGeos), this._barkMat);
        this.treeGroup.add(trunkMesh);

        // 2. LEAVES
        const leafFact = getFactory('leaf');
        const leafData = await leafFact(olam);
        leafData.properties.color = 0xffffff;
        this._leafMat = MaterialManager.create('Standard', leafData.properties, leafData.snippets);
        this.treeGroup.add(new THREE.Mesh(this.mergeGeometries(leafGeos), this._leafMat));

        this.mesh = this.treeGroup;
        const p = this._getValidVector(this.position);
        this.mesh.position.set(p.x, p.y, p.z);

        // ── GROUND PROBE ──
        if (olam.worldOctree) {
            console.log(`B"H - 🌳 [ProceduralTree] Probing for ground for ${this.name}...`);
            const hit = olam.worldOctree.rayIntersect({ origin: new THREE.Vector3(p.x, 200, p.z), direction: new THREE.Vector3(0, -1, 0) });
            if (hit) {
                this.mesh.position.y = hit.position.y;
                console.log(`B"H - 🌳 [ProceduralTree] Found ground at Y: ${hit.position.y}`);
            } else {
                console.warn(`B"H - ⚠️ [ProceduralTree] ${this.name} found NO GROUND. Check Terrain Octree!`);
            }
        }

        this.mesh.updateMatrixWorld(true);
        if (this.isSolid && olam.worldOctree) olam.worldOctree.addObject(trunkMesh);
        
        await olam.hoyseef(this);
        this.isReady = true;
    }

    _getValidVector(v) {
        if (!v) return { x: 0, y: 0, z: 0 };
        if (Array.isArray(v)) return { x: v[0] || 0, y: v[1] || 0, z: v[2] || 0 };
        return { x: v.x || 0, y: v.y || 0, z: v.z || 0 };
    }

    heesHawvoos(dt) {
        if (!this.isReady) return;
        const time = performance.now() / 1000;
        const p = this.olam?.chossid?.mesh?.position || {x: 999, y: 0, z: 999};
        [this._barkMat, this._leafMat].forEach(m => {
            if (m?.userData?.shaderUniforms) {
                if (m.userData.shaderUniforms.uTime) m.userData.shaderUniforms.uTime.value = time;
                if (m.userData.shaderUniforms.uPlayerPos) m.userData.shaderUniforms.uPlayerPos.value.copy(p);
            }
        });
    }
}
