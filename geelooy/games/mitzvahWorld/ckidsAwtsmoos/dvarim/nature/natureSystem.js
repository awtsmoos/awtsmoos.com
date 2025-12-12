
/**
 * B"H
 * Nature System - Manages Instanced Mesh painting
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class NatureSystem {
    constructor(olam) {
        this.olam = olam;
        this.pools = {}; 
        this.dummy = new THREE.Object3D();
        this.raycaster = new THREE.Raycaster();
        this.rayDown = new THREE.Vector3(0, -1, 0);
        this.loadingPools = new Set();
        
        this.olam.on("heesHawvoos", (dt) => this.update(dt));
    }
    
    async initPool(type, maxInstances = 5000, modelPath) {
        if (this.pools[type]) return this.pools[type];
        if (this.loadingPools.has(type)) return null;

        this.loadingPools.add(type);

        // B"H: Map type to path
        if(!modelPath) {
            if (type.includes('rock')) {
                if(type === 'rock') modelPath = "awtsmoos://rockModel1";
                else if(type === 'rock1') modelPath = "awtsmoos://rockModel1";
                else if(type === 'rock2') modelPath = "awtsmoos://rockModel2";
                else if(type === 'rock3') modelPath = "awtsmoos://rockModel3";
            } else if (type.includes('flower')) {
                if(type === 'flower_blue') modelPath = "awtsmoos://flowerBlue";
                else if(type === 'flower_yellow') modelPath = "awtsmoos://flowerYellow";
                else if(type === 'flower_white') modelPath = "awtsmoos://flowerWhite";
                else modelPath = "awtsmoos://flowerBlue"; // Default
            } else {
                modelPath = "awtsmoos://grassModel";
            }
        }

        let geometry, material;
        
        if (modelPath) {
            const actualPath = this.olam.getComponent(modelPath);
            if(actualPath) {
                try {
                    const gltf = await this.olam.boyrayNivra({ path: actualPath });
                    if (gltf && gltf.scene) {
                        const mesh = gltf.scene.getObjectByProperty('isMesh', true);
                        if(mesh) {
                            // B"H FIX: Bake transform
                            mesh.updateMatrixWorld(true);
                            geometry = mesh.geometry.clone();
                            geometry.applyMatrix4(mesh.matrixWorld); 
                            
                            // B"H FIX: Auto-Normalize Geometry Size
                            // This prevents "HUGE" models by forcing them into a standard bounding box height.
                            geometry.computeBoundingBox();
                            const box = geometry.boundingBox;
                            const size = new THREE.Vector3();
                            box.getSize(size);
                            const height = size.y;
                            
                            // Target height: Rocks bigger, grass/flowers smaller
                            let targetHeight = 0.5;
                            if (type.includes('rock')) targetHeight = 0.8;
                            else if (type.includes('grass')) targetHeight = 0.6;
                            else if (type.includes('flower')) targetHeight = 0.7;

                            if (height > 0) {
                                const scaleFactor = targetHeight / height;
                                geometry.scale(scaleFactor, scaleFactor, scaleFactor);
                            }

                            // Re-center pivot to bottom center
                            geometry.computeBoundingBox();
                            const center = new THREE.Vector3();
                            geometry.boundingBox.getCenter(center);
                            const yOffset = geometry.boundingBox.min.y;
                            geometry.translate(-center.x, -yOffset, -center.z);

                            material = mesh.material;
                            if(material.map) material.map.colorSpace = THREE.SRGBColorSpace;
                        }
                    }
                } catch(e) {
                    console.warn("B\"H: Nature asset failed to load", modelPath, e);
                }
            }
        }
        
        // Fallback
        if (!geometry) {
             if(type.includes('grass')) {
                 geometry = new THREE.ConeGeometry(0.1, 0.5, 4);
                 geometry.translate(0, 0.25, 0);
                 material = new THREE.MeshLambertMaterial({ color: 0x00aa00 });
             } else if(type.includes('flower')) {
                 geometry = new THREE.SphereGeometry(0.2, 8, 8);
                 geometry.translate(0, 0.2, 0);
                 material = new THREE.MeshLambertMaterial({ color: 0xff00ff });
             } else {
                 geometry = new THREE.DodecahedronGeometry(0.3);
                 material = new THREE.MeshLambertMaterial({ color: 0x888888 });
             }
        }
        
        // Wind shader
        if (type.includes('grass') || type.includes('flower')) {
             material = material.clone(); 
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
        instancedMesh.frustumCulled = false; 
        
        this.olam.scene.add(instancedMesh);
        
        this.pools[type] = {
            mesh: instancedMesh,
            count: 0,
            max: maxInstances,
            material: material
        };

        this.loadingPools.delete(type);
        return this.pools[type];
    }
    
    paint(type, centerPosition, density = 1) {
        let actualType = type;
        if (type === 'rock') {
            const rockTypes = ['rock1', 'rock2', 'rock3'];
            actualType = rockTypes[Math.floor(Math.random() * rockTypes.length)];
        } else if (type === 'flower') {
            const flowerTypes = ['flower_blue', 'flower_white', 'flower_yellow'];
            actualType = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
        }

        const pool = this.pools[actualType];
        if(!pool) {
            if (!this.loadingPools.has(actualType)) {
                this.initPool(actualType).then(() => {
                    // Retry paint once loaded
                    if(this.pools[actualType]) this.paint(type, centerPosition, density);
                });
            }
            return;
        }
        
        const countToAdd = type.includes('rock') ? 1 : 5; 
        const range = 3;

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
            this.dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
            
            let scale = 1;
            if (actualType.includes('grass') || actualType.includes('flower')) {
                 scale = 0.8 + Math.random() * 0.4;
                 this.dummy.scale.set(scale, scale * (0.8 + Math.random() * 0.5), scale);
            } else {
                 scale = 0.8 + Math.random() * 0.5;
                 this.dummy.scale.setScalar(scale);
            } 
            
            this.dummy.updateMatrix();
            pool.mesh.setMatrixAt(pool.count, this.dummy.matrix);
            pool.count++;
        }
        
        pool.mesh.count = pool.count;
        pool.mesh.instanceMatrix.needsUpdate = true;
    }
    
    update(dt) {
        for(const key in this.pools) {
            const mat = this.pools[key].material;
            if(mat && mat.userData.shader) {
                mat.userData.shader.uniforms.uTime.value += dt;
            }
        }
    }
}
