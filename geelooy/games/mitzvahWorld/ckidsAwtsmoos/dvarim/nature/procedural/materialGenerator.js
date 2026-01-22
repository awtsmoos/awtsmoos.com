/**
 * B"H
 * @file materialGenerator.js
 * Generates materials for nature items.
 * B"H SAFE MODE: All custom shaders disabled.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    get(type) {
        let mat;
        
        if (type.includes('grass')) {
            mat = new THREE.MeshLambertMaterial({ 
                color: 0x44aa44, 
                side: THREE.DoubleSide,
                wireframe: false
            });
            // this.injectWind(mat); // B"H: DISABLED
        } else if (type.includes('rock')) {
            // B"H: Smooth Shaded Rock with Procedural Texture
            const rockTexture = this.generateRockTexture();
            
            mat = new THREE.MeshStandardMaterial({ 
                map: rockTexture,
                color: 0xffffff, // White base to allow tinting
                roughness: 0.9,
                metalness: 0.1,
                flatShading: false, // B"H: Smooth shading
                side: THREE.FrontSide // Optimization: Solid objects don't need double side usually
            });
        } else {
            mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
        }
        
        return mat;
    },
    
    generateRockTexture() {
        if (this._rockTexCache) return this._rockTexCache;

        const size = 256;
        let canvas;

        // B"H: Handle Worker Environment (No DOM)
        if (typeof OffscreenCanvas !== 'undefined') {
            canvas = new OffscreenCanvas(size, size);
        } else if (typeof document !== 'undefined') {
            canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
        } else {
            // Fallback if neither is available (unlikely)
            console.warn("B\"H: No canvas support for rock texture generation.");
            return new THREE.Texture();
        }

        const ctx = canvas.getContext('2d');
        
        // 1. Base Grey
        ctx.fillStyle = "#888888";
        ctx.fillRect(0,0,size,size);
        
        // 2. Noise Generation
        const idata = ctx.getImageData(0,0,size,size);
        const buffer = idata.data;
        
        for(let i=0; i<buffer.length; i+=4) {
            // Random noise -50 to +50
            const noise = (Math.random() - 0.5) * 60; 
            
            // Add noise to base grey (approx 136)
            const val = 136 + noise;
            
            buffer[i] = val;   // R
            buffer[i+1] = val; // G
            buffer[i+2] = val; // B
            // Alpha stays 255
        }
        
        ctx.putImageData(idata, 0, 0);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        this._rockTexCache = texture;
        return texture;
    },

    injectWind(material) {
        // B"H SAFE MODE: Function neutralized.
        console.log("B\"H [MaterialGenerator] Wind shader injection disabled.");
    }
};