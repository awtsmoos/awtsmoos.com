
/**
 * B"H
 * Nature System - Manages Instanced Mesh painting
 */
import * as THREE from '/games/scripts/build/three.module.js';
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js';

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
    
    async initPool(type, maxInstances = 5000, explicitPath = null) {
        if (this.pools[type]) return this.pools[type];
        if (this.loadingPools.has(type)) return null;

        console.log(`B"H Nature Log: initPool called for '${type}' with path: ${explicitPath}`);

        this.loadingPools.add(type);
        
        let modelPath = explicitPath;

        // B"H: ABSOLUTE STRICT PATH MAPPING
        if (!modelPath) {
            if (type.includes('flower')) {
                if (type.includes('blue')) modelPath = "awtsmoos://flowerBlue";
                else if (type.includes('yellow')) modelPath = "awtsmoos://flowerYellow";
                else if (type.includes('white')) modelPath = "awtsmoos://flowerWhite";
                else modelPath = "awtsmoos://flowerBlue"; 
            } else if (type.includes('rock')) {
                if (type === 'rock1') modelPath = "awtsmoos://rockModel1";
                else if (type === 'rock2') modelPath = "awtsmoos://rockModel2";
                else if (type === 'rock3') modelPath = "awtsmoos://rockModel3";
                else modelPath = "awtsmoos://rockModel1";
            } else if (type.includes('grass')) {
                modelPath = "awtsmoos://grassModel";
            } else {
                console.error(`B"H Nature Error: Unknown nature type '${type}' and no path provided.`);
                this.loadingPools.delete(type);
                return null;
            }
        }

        let geometry;
        let materials = [];
        
        if (modelPath) {
            const actualPath = this.olam.getComponent(modelPath);
            if(actualPath) {
                try {
                    const gltf = await this.olam.boyrayNivra({ path: actualPath });
                    if (gltf && gltf.scene) {
                        // B"H: Merge meshes while preserving Multi-Material assignment
                        const geometries = [];
                        
                        gltf.scene.traverse(c => {
                             if(c.isMesh) {
                                 c.updateMatrixWorld(true);
                                 const g = c.geometry.clone();
                                 g.applyMatrix4(c.matrixWorld);
                                 
                                 // Add material to list if not present
                                 // We use the materials array index for the geometry mapping
                                 let matIndex = materials.indexOf(c.material);
                                 if (matIndex === -1) {
                                     materials.push(c.material);
                                     matIndex = materials.length - 1;
                                 }
                                 
                                 // We rely on mergeGeometries(..., true) to create groups.
                                 // However, BufferGeometryUtils simply stacks them 0, 1, 2...
                                 // So we must push them to 'geometries' in the SAME order as 'materials'.
                                 // BUT a mesh might reuse a material. 
                                 
                                 // Strategy: Add a userData property to the geometry indicating which material index it wants.
                                 // Then we manually fix the groups after merge.
                                 g.userData = { materialIndex: matIndex };
                                 geometries.push(g);
                             }
                        });

                        if(geometries.length > 0) {
                            // Merge with useGroups = true
                            geometry = BufferGeometryUtils.mergeGeometries(geometries, true);
                            
                            // B"H FIX: Remap groups to correct material indices
                            // When merged, geometry.groups[i] corresponds to geometries[i]
                            if (geometry.groups && geometry.groups.length === geometries.length) {
                                for(let i=0; i<geometry.groups.length; i++) {
                                    geometry.groups[i].materialIndex = geometries[i].userData.materialIndex;
                                }
                            }
                            
                            // Normalize size and center
                            geometry.computeBoundingBox();
                            const box = geometry.boundingBox;
                            const size = new THREE.Vector3();
                            box.getSize(size);
                            const height = size.y;
                            
                            let targetHeight = 0.5;
                            if (type.includes('rock')) targetHeight = 0.8;
                            else if (type.includes('grass')) targetHeight = 0.6;
                            else if (type.includes('flower')) targetHeight = 0.8;

                            if (height > 0.01) {
                                const scaleFactor = targetHeight / height;
                                geometry.scale(scaleFactor, scaleFactor, scaleFactor);
                            }

                            geometry.computeBoundingBox();
                            const center = new THREE.Vector3();
                            geometry.boundingBox.getCenter(center);
                            const yOffset = geometry.boundingBox.min.y;
                            geometry.translate(-center.x, -yOffset, -center.z);

                            // Ensure textures use SRGB
                            materials.forEach(m => {
                                if(m.map) m.map.colorSpace = THREE.SRGBColorSpace;
                            });
                        }
                    }
                } catch(e) {
                    console.warn("B\"H: Nature asset failed to load", modelPath, e);
                }
            }
        }
        
        // Fallback Geometry
        if (!geometry) {
             console.warn(`B"H Nature Log: Using fallback geometry for ${type}`);
             if(type.includes('grass')) {
                 geometry = new THREE.ConeGeometry(0.1, 0.5, 4);
                 materials.push(new THREE.MeshLambertMaterial({ color: 0x00aa00 }));
             } else {
                 geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
                 materials.push(new THREE.MeshLambertMaterial({ color: 0xff00ff }));
             }
        }
        
        // Wind shader application for ALL materials
        if (type.includes('grass') || type.includes('flower')) {
             materials = materials.map(m => {
                 const mat = m.clone();
                 mat.side = THREE.DoubleSide; 
                 mat.alphaTest = 0.5;
                 mat.onBeforeCompile = (shader) => {
                    shader.uniforms.uTime = { value: 0 };
                    shader.vertexShader = `
                    uniform float uTime;
                    ` + shader.vertexShader.replace('#include <project_vertex>', `
                        vec4 mvPosition = instanceMatrix * vec4(transformed, 1.0);
                        float sway = sin(uTime * 2.0 + mvPosition.x * 0.5) * 0.1 * uv.y;
                        mvPosition.x += sway;
                        mvPosition = modelViewMatrix * mvPosition;
                        gl_Position = projectionMatrix * mvPosition;
                    `);
                    mat.userData.shader = shader;
                };
                return mat;
             });
        }

        // B"H: Create InstancedMesh with Array of Materials
        const instancedMesh = new THREE.InstancedMesh(geometry, materials, maxInstances);
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
            materials: materials // Keep reference to array
        };

        this.loadingPools.delete(type);
        return this.pools[type];
    }
    
    paint(type, centerPosition, density = 1) {
        let actualType = type;
        let explicitPath = null;
        
        if (type.includes('flower')) {
            if (type === 'flower') {
                const flowerTypes = ['flower_blue', 'flower_white', 'flower_yellow'];
                actualType = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
            }
            if(actualType === 'flower_blue') explicitPath = "awtsmoos://flowerBlue";
            else if(actualType === 'flower_yellow') explicitPath = "awtsmoos://flowerYellow";
            else if(actualType === 'flower_white') explicitPath = "awtsmoos://flowerWhite";
            
        } else if (type.includes('rock')) {
            if (type === 'rock') {
                 const rockTypes = ['rock1', 'rock2', 'rock3'];
                 actualType = rockTypes[Math.floor(Math.random() * rockTypes.length)];
            }
            if(actualType === 'rock1') explicitPath = "awtsmoos://rockModel1";
            else if(actualType === 'rock2') explicitPath = "awtsmoos://rockModel2";
            else if(actualType === 'rock3') explicitPath = "awtsmoos://rockModel3";

        } else if (type === 'grass') {
             explicitPath = "awtsmoos://grassModel";
        }

        const pool = this.pools[actualType];
        if(!pool) {
            if (!this.loadingPools.has(actualType) && explicitPath) {
                this.initPool(actualType, 5000, explicitPath);
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
            // Update ALL materials in the array
            const mats = this.pools[key].materials;
            if(mats) {
                mats.forEach(mat => {
                    if(mat && mat.userData.shader) {
                        mat.userData.shader.uniforms.uTime.value += dt;
                    }
                });
            }
        }
    }
}
