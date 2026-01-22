/**
 * B"H
 * Nature System - Manages Instanced Mesh painting & Water Dynamics.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import PoolFactory from './natureSystem/PoolFactory.js';
import Painter from './natureSystem/Painter.js';

export default class NatureSystem {
    constructor(olam) {
        this.olam = olam;
        this.pools = {}; 
        this.loadingPools = new Set();
        this.painter = new Painter(olam, this.pools);
        
        // B"H: Water Particles
        this.waterParticles = [];
        this.maxWaterParticles = 1000;
        this.raycaster = new THREE.Raycaster();

        this.olam.on("heesHawvoos", (dt) => this.update(dt));
    }
    
    async initPool(type, maxInstances = 5000) {
        if (this.pools[type]) return this.pools[type];
        if (this.loadingPools.has(type)) return null;

        console.log(`B"H Nature Log: initPool called for '${type}'`);
        this.loadingPools.add(type);
        
        const pool = await PoolFactory.initPool(type, maxInstances, this.olam, this.pools, null);
        this.loadingPools.delete(type);
        return pool;
    }
    
    paint(type, centerPosition) {
        if(type === 'water_source') {
             this.spawnWellspring(centerPosition);
             return;
        }
        this.painter.paint(type, centerPosition, PoolFactory, this.loadingPools);
    }
    
    // B"H: Water Flow Logic
    spawnWellspring(pos) {
        for(let i=0; i<20; i++) {
            this.spawnWaterParticle(pos);
        }
    }
    
    spawnWaterParticle(pos) {
        if(this.waterParticles.length > this.maxWaterParticles) return;
        
        const geo = new THREE.BoxGeometry(0.3, 0.1, 0.3); // Flat water voxels
        const mat = new THREE.MeshBasicMaterial({ color: 0x00aaff, opacity: 0.6, transparent: true });
        const mesh = new THREE.Mesh(geo, mat);
        
        mesh.position.copy(pos);
        mesh.position.x += (Math.random()-0.5);
        mesh.position.z += (Math.random()-0.5);
        
        this.olam.scene.add(mesh);
        
        this.waterParticles.push({
            mesh: mesh,
            velocity: new THREE.Vector3(0,0,0),
            life: 10.0 // Flow for 10 seconds
        });
    }

    update(dt) {
        let playerPos = new THREE.Vector3(0, -1000, 0);
        if(this.olam.chossid && this.olam.chossid.mesh) {
            playerPos.copy(this.olam.chossid.mesh.position);
        }
        
        // Sun Position (Assuming Environment Class exists)
        let sunPos = new THREE.Vector3(0, 100, 0);
        if(this.olam.mainSun) {
            sunPos.copy(this.olam.mainSun.position);
        }

        // Update Instanced Nature Uniforms
        for(const key in this.pools) {
            const material = this.pools[key].material;
            const updateMat = (mat) => {
                if(mat && mat.userData.shader) {
                    const uniforms = mat.userData.shader.uniforms;
                    if(uniforms.uTime) uniforms.uTime.value += dt;
                    if(uniforms.uPlayerPosition) uniforms.uPlayerPosition.value.copy(playerPos);
                    if(uniforms.uSunPosition) uniforms.uSunPosition.value.copy(sunPos);
                }
            };
            if (Array.isArray(material)) material.forEach(updateMat);
            else updateMat(material);
        }
        
        // Update Water Flow
        for(let i = this.waterParticles.length - 1; i >= 0; i--) {
            const p = this.waterParticles[i];
            p.life -= dt;
            p.velocity.y -= 9.8 * dt; // Gravity
            
            const nextPos = p.mesh.position.clone().add(p.velocity.clone().multiplyScalar(dt));
            
            // Check Collision with Ground
            this.raycaster.set(p.mesh.position, new THREE.Vector3(0, -1, 0));
            const hit = this.olam.worldOctree ? this.olam.worldOctree.rayIntersect(this.raycaster.ray) : null;
            
            if (hit && hit.distance < 0.2) {
                p.velocity.y = 0;
                p.mesh.position.y = hit.point.y + 0.1;
                const slope = hit.normal;
                p.velocity.x += slope.x * 5 * dt;
                p.velocity.z += slope.z * 5 * dt;
                p.velocity.x *= 0.9;
                p.velocity.z *= 0.9;
            } else {
                p.mesh.position.copy(nextPos);
            }
            
            if (p.life <= 0) {
                p.mesh.removeFromParent();
                this.waterParticles.splice(i, 1);
            }
        }
    }
}
