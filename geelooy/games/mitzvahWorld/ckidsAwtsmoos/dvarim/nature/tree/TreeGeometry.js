
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

        // 1. The Trunk — 12 sides for smooth bark displacement
        const trunk = new THREE.CylinderGeometry(trunkR * 0.4, trunkR, trunkH, 12, 8);
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
        // B"H: Proliferate the leaves into dense, interwoven twigs
        const twigCount = 8;
        for (let t = 0; t < twigCount; t++) {
            const ax = (Math.random() - 0.5) * Math.PI;
            const az = (Math.random() - 0.5) * Math.PI;
            
            const leafCount = 10; 
            const leafScale = s * 0.25; 
            
            for (let i = 0; i < leafCount; i++) {
                const p = new THREE.PlaneGeometry(leafScale, leafScale);
                
                // Position along the invisible twig
                const h = (i / leafCount) * (s * 0.9) + (Math.random() * 0.1);
                const ang = i * Math.PI * 0.7; // Spiral around twig
                const dist = 0.05 * s;
                
                p.translate(Math.cos(ang)*dist, h, Math.sin(ang)*dist);
                
                // Natural leaf droop
                p.rotateX(Math.random() * Math.PI);
                p.rotateY(Math.random() * Math.PI);
                p.rotateZ(Math.random() * Math.PI);
                
                // Orient cluster along twig direction
                p.rotateX(ax);
                p.rotateZ(az);
                
                // B"H: Random spherical distribution for overall cluster volume
                const rRadius = s * (0.1 + Math.random() * 0.5);
                const rTheta = Math.random() * Math.PI * 2;
                const ox = rRadius * Math.sin(rTheta);
                const oz = rRadius * Math.cos(rTheta);

                p.translate(cx + ox, cy, cz + oz);
                target.push(p);
            }
        }
    }
}

