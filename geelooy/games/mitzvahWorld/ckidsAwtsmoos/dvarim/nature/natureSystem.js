
/**
 * B"H
 * Nature System - Manages Instanced Mesh painting
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { simplex2d } from '../../utils/math/noise.js';

export default class NatureSystem {
    constructor(olam) {
        this.olam = olam;
        this.pools = {}; // { 'grass': { mesh, count, max } }
        this.dummy = new THREE.Object3D();
        
        this.olam.on("heesHawvoos", (dt) => this.update(dt));
    }
    
    async initPool(type, maxInstances = 10000, modelPath) {
        if(this.pools[type]) return this.pools[type];
        
        let geometry, material;
        
        if (modelPath) {
            // Load GLB
            const gltf = await this.olam.boyrayNivra({ path: modelPath });
            if (gltf && gltf.scene) {
                const mesh = gltf.scene.getObjectByProperty('isMesh', true);
                if(mesh) {
                    geometry = mesh.geometry;
                    material = mesh.material;
                    if(material.map) material.map.colorSpace = THREE.SRGBColorSpace;
                }
            }
        }
        
        // Fallback
        if (!geometry) {
             if (type === 'grass') {
                 geometry = new THREE.PlaneGeometry(0.5, 1);
                 geometry.translate(0, 0.5, 0); // Pivot at bottom
                 material = new THREE.MeshLambertMaterial({ color: 0x33aa33, side: THREE.DoubleSide });
             } else {
                 geometry = new THREE.DodecahedronGeometry(0.5);
                 material = new THREE.MeshLambertMaterial({ color: 0x888888 });
             }
        }
        
        // Wind shader for grass
        if (type === 'grass') {
             material.onBeforeCompile = (shader) => {
                shader.uniforms.uTime = { value: 0 };
                shader.vertexShader = `
                uniform float uTime;
                ` + shader.vertexShader.replace('#include <project_vertex>', `
                    vec4 mvPosition = instanceMatrix * vec4(transformed, 1.0);
                    float sway = sin(uTime * 2.0 + mvPosition.x * 0.5) * 0.2 * uv.y;
                    mvPosition.x += sway;
                    mvPosition = modelViewMatrix * mvPosition;
                    gl_Position = projectionMatrix * mvPosition;
                `);
                material.userData.shader = shader;
            };
        }

        const instancedMesh = new THREE.InstancedMesh(geometry, material, maxInstances);
        instancedMesh.count = 0;
        instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        instancedMesh.receiveShadow = true;
        instancedMesh.castShadow = true;
        
        this.olam.scene.add(instancedMesh);
        
        this.pools[type] = {
            mesh: instancedMesh,
            count: 0,
            max: maxInstances,
            material: material
        };
        
        return this.pools[type];
    }
    
    paint(type, position, density = 1) {
        const pool = this.pools[type];
        if(!pool) {
            // Auto-init fallback
            this.initPool(type).then(() => this.paint(type, position, density));
            return;
        }
        
        // Paint a patch
        const range = 2; // radius
        const countToAdd = 5;
        
        for(let i=0; i<countToAdd; i++) {
            if (pool.count >= pool.max) break;
            
            const offsetX = (Math.random() - 0.5) * range;
            const offsetZ = (Math.random() - 0.5) * range;
            
            this.dummy.position.set(position.x + offsetX, position.y, position.z + offsetZ);
            
            // Randomize rotation/scale
            this.dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
            const scale = 0.8 + Math.random() * 0.4;
            this.dummy.scale.setScalar(scale);
            if(type === 'grass') this.dummy.scale.y *= (0.8 + Math.random() * 0.5);
            
            this.dummy.updateMatrix();
            pool.mesh.setMatrixAt(pool.count, this.dummy.matrix);
            pool.count++;
        }
        
        pool.mesh.count = pool.count;
        pool.mesh.instanceMatrix.needsUpdate = true;
    }
    
    update(dt) {
        // Update shaders
        for(const key in this.pools) {
            const mat = this.pools[key].material;
            if(mat && mat.userData.shader) {
                mat.userData.shader.uniforms.uTime.value += dt;
            }
        }
    }
}
