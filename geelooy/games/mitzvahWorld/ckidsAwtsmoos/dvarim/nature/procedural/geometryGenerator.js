
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
        // B"H: Improved Grass Tuft - Curved & Segmented
        const bladeCount = 8;
        const geometries = [];
        
        // Blade Parameters
        const bladeW = 0.12;
        const bladeH = 0.8;
        const joints = 5; 
        
        const baseBlade = new THREE.PlaneGeometry(bladeW, bladeH, 1, joints);
        const pos = baseBlade.attributes.position;
        
        // Modify vertices to taper and curve
        for(let i=0; i<pos.count; i++) {
            const y = pos.getY(i);
            const x = pos.getX(i);
            
            // Normalize Y from 0 (bottom) to 1 (top)
            // Clamp min to 0 to avoid negative numbers in Math.pow (Fixes NaN crash)
            let h = (y + bladeH/2) / bladeH;
            if(h < 0) h = 0;
            if(h > 1) h = 1;
            
            // 1. Taper Width: quadratic taper to point
            const taper = Math.max(0, 1.0 - Math.pow(h, 1.5)); 
            const newX = x * taper;
            
            // 2. Curve: parabolic bend in Z direction
            const bend = Math.pow(h, 2) * 0.5; 
            
            pos.setX(i, newX);
            pos.setZ(i, bend);
        }
        
        baseBlade.computeVertexNormals();
        baseBlade.translate(0, bladeH/2, 0); 

        for (let i = 0; i < bladeCount; i++) {
            const g = baseBlade.clone();
            
            // Random Rotation around Y
            const angle = (i / bladeCount) * Math.PI * 2 + (Math.random() * 0.5);
            g.rotateY(angle);
            
            // Random outward flare
            g.rotateX((Math.random() * 0.3) + 0.1);
            
            // Random Scale
            const s = 0.7 + Math.random() * 0.5;
            g.scale(s, s, s);
            
            // Random Positional Jitter
            g.translate((Math.random()-0.5)*0.15, 0, (Math.random()-0.5)*0.15);
            
            geometries.push(g);
        }

        if(geometries.length === 0) return new THREE.BoxGeometry(0.1, 0.5, 0.1);

        const merged = BufferGeometryUtils.mergeGeometries(geometries);
        return merged;
    },

    rock(type) {
        // B"H: Smoother Rock Low Poly
        // Detail 0 = Icosahedron (12 verts, 20 faces).
        // Detail 1 = 80 faces.
        const detail = 0; 
        const geometry = new THREE.IcosahedronGeometry(0.4, detail);
        
        // Ensure index exists to allow sharing of vertices for smooth shading
        if(!geometry.index) {
             // Should have index by default, but safety check.
        }

        const pos = geometry.attributes.position;
        const seed = Math.random() * 100;
        const freq = 2.5; 
        
        const vec = new THREE.Vector3();

        for(let i=0; i<pos.count; i++) {
            vec.fromBufferAttribute(pos, i);
            
            const x = vec.x;
            const y = vec.y;
            const z = vec.z;
            
            // Large scale noise for shape
            const noise1 = Math.sin(x * freq + seed) * Math.cos(y * freq + seed) * Math.sin(z * freq + seed);
            
            // Small scale noise for surface texture (bumpy)
            const noise2 = Math.cos(x * 10 + seed) * Math.sin(y * 10 + seed);
            
            // Less extreme displacement to keep shape cleaner
            const displacement = 1.0 + (noise1 * 0.2) + (noise2 * 0.03); 
            
            vec.multiplyScalar(displacement);
            
            // Flatten bottom slightly for stability look
            if(vec.y < -0.2) vec.y *= 0.6; 

            pos.setXYZ(i, vec.x, vec.y, vec.z);
        }
        
        // B"H: Explicitly delete existing normals to force full re-computation
        // This ensures the new smooth normals reflect the displaced shape perfectly
        if(geometry.attributes.normal) geometry.deleteAttribute('normal');
        geometry.computeVertexNormals();
        
        // Random Global Scale
        const scaleX = 0.8 + Math.random() * 0.4;
        const scaleY = 0.7 + Math.random() * 0.3;
        const scaleZ = 0.8 + Math.random() * 0.4;
        geometry.scale(scaleX, scaleY, scaleZ);

        return geometry;
    },
    
    flower(type) { return new THREE.BoxGeometry(0.1,0.1,0.1); }
};
