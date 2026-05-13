/**
 * B"H
 * @file proceduralTree.js
 * @description
 * 🌳 THE LIVING TREE — Refactored for Infinite Species 🌳
 * 
 * Chapter 50: The Arboretum of Atzilus.
 * "Out of the ground the Lord God caused to grow every tree that is pleasant to the sight..."
 * (Bereishis 2:9)
 */

import Domem from "../../chayim/domem/index.js";
import { getFactory } from "./procedural/materials/registry/index.js";
import MaterialManager from "../../chayim/math/MaterialManager.js";
import TreeGeometry from "./tree/TreeGeometry.js";
import RealisticTreeGenerator from "../../systems/RealisticTreeGenerator.js";
import * as THREE from '/games/scripts/build/three.module.js';
import { mergeGeometries } from '/games/scripts/jsm/utils/BufferGeometryUtils.js';

export default class ProceduralTree extends Domem {
    constructor(op, olam) {
        super(op, olam);
        this.name = op.name || "Tree_" + Math.random();
        this.preset = op.preset || "Oak";
        this.isRealistic = op.isRealistic || false;
        
        // B"H: Default dimensions
        this._trunkH = 8 + Math.random() * 4;
        this._trunkR = 0.5 + Math.random() * 0.3;
        this._leafSz = 4 + Math.random() * 2;
    }

    async heescheel(olam) {
        this.olam = olam;
        this.treeGroup = new THREE.Group();
        console.log(`B"H - 🌳 [ProceduralTree] Manifesting ${this.preset} (${this.name})...`);

        if (this.isRealistic) {
            await this._manifestRealistic(olam);
        } else {
            await this._manifestClassic(olam);
        }

        this.mesh = this.treeGroup;
        const p = this._getValidVector(this.position);
        this.mesh.position.set(p.x, p.y, p.z);

        // Ground Probe
        if (olam.worldOctree) {
            const ray = new THREE.Ray(new THREE.Vector3(p.x, 500, p.z), new THREE.Vector3(0, -1, 0));
            let hit = olam.worldOctree.rayIntersect(ray);
            if (hit) this.mesh.position.y = hit.position.y;
        }

        this.mesh.updateMatrixWorld(true);

        if (this.isSolid && olam.worldOctree) {
            const colGeo = new THREE.CylinderGeometry(this._trunkR, this._trunkR, this._trunkH, 8);
            const colMesh = new THREE.Mesh(colGeo, new THREE.MeshBasicMaterial({ visible: false }));
            colMesh.position.copy(this.mesh.position);
            colMesh.position.y += this._trunkH / 2;
            colMesh.updateMatrixWorld(true);
            olam.worldOctree.addObject(colMesh);
        }

        await olam.hoyseef(this);
        this.isReady = true;
    }

    async _manifestRealistic(olam) {
        const data = RealisticTreeGenerator.generate(this.preset);
        
        // 1. TRUNK
        const barkFact = getFactory(data.trunk.material);
        const barkData = await barkFact(olam);
        const trunkMat = MaterialManager.create('Standard', barkData.properties, barkData.snippets);
        const trunkGeo = new THREE.CylinderGeometry(...data.trunk.args);
        trunkGeo.translate(0, data.trunk.args[2] / 2, 0);
        this.treeGroup.add(new THREE.Mesh(trunkGeo, trunkMat));
        this._barkMat = trunkMat;

        // 2. LEAVES (CUSTOM SHAPE AND MATERIAL)
        const leafFact = getFactory(data.leaves.material);
        const leafData = await leafFact(olam);
        const leafMat = MaterialManager.create('Standard', leafData.properties, leafData.snippets);
        
        let leafGeo;
        const ga = data.leaves.args;
        if (data.leaves.geometry === "SphereGeometry") leafGeo = new THREE.SphereGeometry(...ga);
        else if (data.leaves.geometry === "ConeGeometry") leafGeo = new THREE.ConeGeometry(...ga);
        else if (data.leaves.geometry === "CylinderGeometry") leafGeo = new THREE.CylinderGeometry(...ga);
        else leafGeo = new THREE.PlaneGeometry(ga[0], ga[1]);

        if (data.leaves.scale) leafGeo.scale(...data.leaves.scale);
        leafGeo.translate(data.leaves.offset.x, data.leaves.offset.y, data.leaves.offset.z);
        
        const crown = new THREE.Mesh(leafGeo, leafMat);
        crown.castShadow = true;
        crown.receiveShadow = true;
        this.treeGroup.add(crown);
        this._leafMat = leafMat;
        
        this._trunkH = data.trunk.args[2];
        this._trunkR = data.trunk.args[1];
    }

    async _manifestClassic(olam) {
        const { branchGeos, leafGeos } = TreeGeometry.generate(this._trunkH, this._trunkR, this._leafSz, this._trunkH * 0.5);
        
        const barkFact = getFactory('bark');
        const barkData = await barkFact(olam);
        this._barkMat = MaterialManager.create('Standard', barkData.properties, barkData.snippets);
        const branchMesh = new THREE.Mesh(this.mergeGeometries(branchGeos), this._barkMat);
        branchMesh.castShadow = true;
        branchMesh.receiveShadow = true;
        this.treeGroup.add(branchMesh);

        const leafFact = getFactory('leaf');
        const leafData = await leafFact(olam);
        this._leafMat = MaterialManager.create('Standard', leafData.properties, leafData.snippets);
        const leafMesh = new THREE.Mesh(this.mergeGeometries(leafGeos), this._leafMat);
        leafMesh.castShadow = true;
        leafMesh.receiveShadow = true;
        this.treeGroup.add(leafMesh);
    }

    mergeGeometries(geos) {
        if (!geos || geos.length === 0) return new THREE.BufferGeometry();
        const normalized = geos.map(geo => geo.index ? geo.toNonIndexed() : geo);
        return mergeGeometries(normalized, false) || geos[0];
    }

    _getValidVector(v) {
        if (!v) return { x: 0, y: 0, z: 0 };
        if (Array.isArray(v)) return { x: v[0] || 0, y: v[1] || 0, z: v[2] || 0 };
        return { x: v.x || 0, y: v.y || 0, z: v.z || 0 };
    }
}
