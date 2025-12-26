
//B"H
/**
 * Nature System - Manages Instanced Mesh painting.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import poolManager from './natureSystem/poolManager.js';

export default class NatureSystem {
    constructor(olam) {
        this.olam = olam;
        this.pools = {}; 
        this.dummy = new THREE.Object3D();
        this.raycaster = new THREE.Raycaster();
        this.rayDown = new THREE.Vector3(0, -1, 0);
        this.loadingPools = new Set();
        this.colorHelper = new THREE.Color();
        this.fallbackMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        
        Object.assign(this, poolManager);

        this.olam.on("heesHawvoos", (dt) => this.update(dt));
    }
    
    paint(type, centerPosition) {
        if (!centerPosition || isNaN(centerPosition.x)) return;

        let actualType = type;
        if (type === 'grass') actualType = 'grass_field'; 
        else if (type === 'rock') {
            const vars = ['rock_boulder', 'rock_slate'];
            actualType = vars[Math.floor(Math.random() * vars.length)];
        } else if (type === 'flower') {
            const vars = ['flower_blue', 'flower_white', 'flower_yellow'];
            actualType = vars[Math.floor(Math.random() * vars.length)];
        }

        const pool = this.pools[actualType];
        if(!pool) {
            if (!this.loadingPools.has(actualType)) this.initPool(actualType);
            return;
        }
        
        const countToAdd = type.includes('rock') ? 1 : 3; 
        const range = 2;

        for(let i=0; i<countToAdd; i++) {
            if (pool.count >= pool.max) break;
            
            const offsetX = (Math.random() - 0.5) * range;
            const offsetZ = (Math.random() - 0.5) * range;
            const targetX = centerPosition.x + offsetX;
            const targetZ = centerPosition.z + offsetZ;
            
            let yPos = centerPosition.y;
            if(this.olam.worldOctree) {
                this.raycaster.set(new THREE.Vector3(targetX, yPos + 10, targetZ), this.rayDown);
                const hit = this.olam.worldOctree.rayIntersect(this.raycaster.ray);
                if(hit) yPos = hit.position.y;
            }
            
            this.dummy.position.set(targetX, yPos, targetZ);
            this.dummy.rotation.set((Math.random() - 0.5) * 0.2, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.2);
            
            let scale = 1;
            this.colorHelper.copy(pool.baseColor || new THREE.Color(0xffffff));

            if (actualType.includes('grass')) {
                 scale = 0.8 + Math.random() * 0.6;
                 this.dummy.scale.set(scale, scale * (0.8 + Math.random() * 0.5), scale);
                 this.colorHelper.offsetHSL((Math.random() - 0.5) * 0.08, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.15);
            } else if (actualType.includes('rock')) {
                 scale = 0.8 + Math.random() * 0.8;
                 this.dummy.scale.set(scale, scale * 0.8, scale);
                 this.colorHelper.offsetHSL(0, 0, (Math.random() - 0.5) * 0.2);
            } else if (actualType.includes('flower')) {
                 scale = 0.8 + Math.random() * 0.6;
                 this.dummy.scale.set(scale, scale * (0.8 + Math.random() * 0.5), scale);
                 this.colorHelper.offsetHSL(0, 0, (Math.random() - 0.5) * 0.1);
            }
            
            this.dummy.updateMatrix();
            pool.mesh.setMatrixAt(pool.count, this.dummy.matrix);
            if (pool.mesh.setColorAt) pool.mesh.setColorAt(pool.count, this.colorHelper);
            pool.count++;
        }
        
        pool.mesh.count = pool.count;
        pool.mesh.instanceMatrix.needsUpdate = true;
        if(pool.mesh.instanceColor) pool.mesh.instanceColor.needsUpdate = true;
    }
    
    update(dt) {
        let playerPos = null;
        if(this.olam.chossid && this.olam.chossid.mesh) playerPos = this.olam.chossid.mesh.position;

        for(const key in this.pools) {
            const material = this.pools[key].material;
            const updateMat = (mat) => {
                if(mat && mat.userData.shader) {
                    const uniforms = mat.userData.shader.uniforms;
                    if(uniforms.uTime) uniforms.uTime.value += dt;
                    if(uniforms.uPlayerPosition && playerPos) uniforms.uPlayerPosition.value.copy(playerPos);
                }
            };
            if (Array.isArray(material)) material.forEach(updateMat);
            else updateMat(material);
        }
    }
}
