
/**
 * @file TreeGeometry.js
 * @description
 * 📐 CHAPTER 1: THE GEOMETRY OF GROWTH 📐
 */

import * as THREE from '/games/scripts/build/three.module.js';

export default class TreeGeometry {
    static generate(trunkH, trunkR, leafSz, branchL) {
        const branchGeos = [];
        const leafGeos = [];

        // 1. The Trunk
        const trunk = new THREE.CylinderGeometry(trunkR * 0.4, trunkR, trunkH, 8);
        trunk.translate(0, trunkH / 2, 0);
        branchGeos.push(trunk);

        // 2. The Crown
        this._addLeafCluster(leafGeos, 0, trunkH, 0, leafSz);

        // 3. Branches
        const attachY = trunkH * 0.75;
        const angles = [[0.7,0.7],[-0.7,0.7],[0.7,-0.7],[-0.7,-0.7]];
        
        angles.forEach(([ax, az]) => {
            const bGeo = new THREE.CylinderGeometry(trunkR * 0.2, trunkR * 0.4, branchL, 6);
            bGeo.translate(0, branchL / 2, 0);
            bGeo.rotateX(ax); bGeo.rotateZ(az);
            bGeo.translate(0, attachY, 0);
            branchGeos.push(bGeo);

            // Tip Clusters
            const tx = Math.sin(az) * branchL;
            const ty = attachY + Math.cos(az) * Math.cos(ax) * branchL;
            const tz = Math.sin(ax) * branchL;
            this._addLeafCluster(leafGeos, tx, ty, tz, leafSz);
        });

        return { branchGeos, leafGeos };
    }

    static _addLeafCluster(target, cx, cy, cz, s) {
        const OFFSETS = [[0,0,0],[1.8,0.6,0],[-1.8,0.6,0],[0,0.6,1.8],[0,0.6,-1.8]];
        OFFSETS.forEach(([ox, oy, oz]) => {
            const p = new THREE.PlaneGeometry(s, s);
            p.rotateX(Math.random() * Math.PI);
            p.rotateY(Math.random() * Math.PI);
            p.translate(cx + ox * (s * 0.4), cy + oy * (s * 0.4), cz + oz * (s * 0.4));
            target.push(p);
        });
    }
}
