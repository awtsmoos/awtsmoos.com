/**
 * B"H
 * @file geometryGenerator.js
 * Generates procedural geometries for nature elements.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js';

export default {
    get(type) {
        if (type.includes('grass')) return this.grass(type);
        if (type.includes('rock')) return this.rock(type);
        return new THREE.BoxGeometry(0.5, 0.5, 0.5);
    },

    grass(type) {
        // B"H: Multi-blade clumps for density
        const bladeCount = 6; 
        const geometries = [];
        
        const bladeW = 0.15;
        const bladeH = 0.8;
        const joints = 4;
        
        const baseBlade = new THREE.PlaneGeometry(bladeW, bladeH, 1, joints);
        const pos = baseBlade.attributes.position;
        
        for(let i=0; i<pos.count; i++) {
            const y = pos.getY(i);
            const x = pos.getX(i);
            
            let h = (y + bladeH/2) / bladeH; // 0 to 1
            if(h < 0) h = 0; if(h > 1) h = 1;
            
            // Taper
            const taper = Math.max(0, 1.0 - Math.pow(h, 2)); 
            const newX = x * taper;
            
            // Curve out
            const curve = Math.pow(h, 2) * 0.3;
            
            pos.setX(i, newX);
            pos.setZ(i, curve);
        }
        baseBlade.computeVertexNormals();
        baseBlade.translate(0, bladeH/2, 0);

        for (let i = 0; i < bladeCount; i++) {
            const g = baseBlade.clone();
            
            const angle = (i / bladeCount) * Math.PI * 2 + (Math.random() * 0.5);
            const tilt = Math.random() * 0.3;
            
            g.rotateY(angle);
            g.rotateX(tilt);
            
            const s = 0.6 + Math.random() * 0.6;
            g.scale(s, s, s);
            g.translate((Math.random()-0.5)*0.2, 0, (Math.random()-0.5)*0.2);
            
            geometries.push(g);
        }

        return BufferGeometryUtils.mergeGeometries(geometries);
    },

    rock(type) {
        // B"H: Detailed Rock
        const geometry = new THREE.DodecahedronGeometry(0.5, 1); // Subdivided
        const pos = geometry.attributes.position;
        const seed = Math.random() * 100;
        
        const v = new THREE.Vector3();
        for(let i=0; i<pos.count; i++) {
            v.fromBufferAttribute(pos, i);
            
            // Simplex-like distortion (pseudo)
            const n1 = Math.sin(v.x * 5 + seed) * Math.cos(v.y * 5 + seed);
            const n2 = Math.cos(v.z * 8 + seed);
            
            const disp = 1.0 + (n1 * 0.2) + (n2 * 0.1);
            v.multiplyScalar(disp);
            
            // Flatten bottom for stability
            if(v.y < -0.3) v.y = -0.3;

            pos.setXYZ(i, v.x, v.y, v.z);
        }
        
        geometry.computeVertexNormals();
        return geometry;
    }
};
