// B"H
/**
 * @file ProceduralRoad.js
 * @module ProceduralRoad
 * @description THE PATH OF THE CHASSID — Abstracted and Purified.
 */

import Tzomayach from "../../chayim/tzomayach.js";
import * as THREE from '/games/scripts/build/three.module.js';

export default class ProceduralRoad extends Tzomayach {
    type = "ProceduralRoad";

    constructor(op, olam) {
        super(op, olam);
        this.points = op.points || [[0,0], [10,10]];
        this.width = op.width || 8;
        this.sidewalkWidth = op.sidewalkWidth || 2;
        this.sidewalkHeight = op.sidewalkHeight || 0.3;
        this.curveType = op.curveType || 'smooth'; // 'smooth' or 'linear'
        this.isSolid = op.isSolid ?? true;
    }

    async heescheel(olam) {
        this.olam = olam;
        this.mesh = new THREE.Group();
        const roadMat = new THREE.MeshStandardMaterial({ color: 0x6b4d2e, roughness: 0.95 });
        const edgeMat = new THREE.MeshStandardMaterial({ color: 0x3f7a34, roughness: 0.9 });

        for (let i = 0; i < this.points.length - 1; i++) {
            const a = this.points[i];
            const b = this.points[i + 1];
            const ax = a[0], az = a[1], bx = b[0], bz = b[1];
            const dx = bx - ax;
            const dz = bz - az;
            const length = Math.max(1, Math.sqrt(dx * dx + dz * dz));
            const angle = Math.atan2(dx, dz);

            const segment = new THREE.Mesh(new THREE.PlaneGeometry(this.width, length), roadMat);
            segment.rotation.x = -Math.PI / 2;
            segment.rotation.z = angle;
            segment.position.set((ax + bx) / 2, 0.08, (az + bz) / 2);
            segment.receiveShadow = true;
            segment.userData.isRoad = true;
            this.mesh.add(segment);

            const edgeWidth = Math.max(0.5, this.sidewalkWidth || 1);
            [-1, 1].forEach(side => {
                const edge = new THREE.Mesh(new THREE.PlaneGeometry(edgeWidth, length), edgeMat);
                edge.rotation.x = -Math.PI / 2;
                edge.rotation.z = angle;
                const ox = Math.cos(angle) * (this.width / 2 + edgeWidth / 2) * side;
                const oz = -Math.sin(angle) * (this.width / 2 + edgeWidth / 2) * side;
                edge.position.set((ax + bx) / 2 + ox, 0.075, (az + bz) / 2 + oz);
                edge.receiveShadow = true;
                this.mesh.add(edge);
            });
        }
        this.mesh.name = `ProceduralRoad_${this.id}`;

        const p = this.position ? (typeof this.position.vector3 === 'function' ? this.position.vector3() : this.position) : {x:0, y:0, z:0};
        this.mesh.position.set(p.x, p.y || 0, p.z);

        this.mesh.updateMatrixWorld(true);

        await olam.hoyseef(this);
        
        this.isReady = true;
        this.ayshPeula("heescheel", this);
    }
}
