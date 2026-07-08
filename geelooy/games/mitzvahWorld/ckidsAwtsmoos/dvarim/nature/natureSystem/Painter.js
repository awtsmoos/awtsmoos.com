// B"H
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class Painter {
    constructor(olam, pools) {
        this.olam = olam;
        this.pools = pools;
        this.dummy = new THREE.Object3D();
        this.colorHelper = new THREE.Color();
        this.raycaster = new THREE.Raycaster();
        this.rayDown = new THREE.Vector3(0, -1, 0);
    }
    
    paint(type, centerPosition, PoolFactory, loadingPools) {
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
            if (!loadingPools.has(actualType)) {
                loadingPools.add(actualType);
                PoolFactory.initPool(actualType, 5000, this.olam, this.pools, null).then(() => {
                    loadingPools.delete(actualType);
                });
            }
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
            
            this.dummy.rotation.set(
                (Math.random() - 0.5) * 0.1, 
                Math.random() * Math.PI * 2, 
                (Math.random() - 0.5) * 0.1  
            );
            
            let scale = 1;
            
            if(pool.baseColor) {
                this.colorHelper.copy(pool.baseColor);
            } else {
                this.colorHelper.setHex(0xffffff);
            }

            if (actualType.includes('grass')) {
                 scale = 0.8 + Math.random() * 0.6;
                 this.dummy.scale.set(scale, scale * (0.8 + Math.random() * 0.5), scale);
                 const h = (Math.random() - 0.5) * 0.08;
                 const s = (Math.random() - 0.5) * 0.1; 
                 const l = (Math.random() - 0.5) * 0.15;
                 this.colorHelper.offsetHSL(h, s, l);
                 
            } else if (actualType.includes('rock')) {
                 scale = 0.8 + Math.random() * 0.8;
                 this.dummy.scale.set(scale, scale * 0.8, scale);
                 const l = (Math.random() - 0.5) * 0.2; 
                 this.colorHelper.offsetHSL(0, 0, l);

            } else if (actualType.includes('flower')) {
                 scale = 0.8 + Math.random() * 0.6;
                 this.dummy.scale.set(scale, scale * (0.8 + Math.random() * 0.5), scale);
                 const l = (Math.random() - 0.5) * 0.1;
                 this.colorHelper.offsetHSL(0, 0, l);
            }
            
            this.dummy.updateMatrix();
            pool.mesh.setMatrixAt(pool.count, this.dummy.matrix);
            
            if (pool.mesh.setColorAt) {
                pool.mesh.setColorAt(pool.count, this.colorHelper);
            }
            
            pool.count++;
        }
        
        pool.mesh.count = pool.count;
        pool.mesh.instanceMatrix.needsUpdate = true;
        if(pool.mesh.instanceColor) pool.mesh.instanceColor.needsUpdate = true;
    }
}
