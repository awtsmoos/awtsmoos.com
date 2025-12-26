//B"H
/**
 * Nature System - Manages Instanced Mesh painting.
 * Hardened against multi-material hazards and missing vessels.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js';
import GeometryGenerator from './procedural/geometryGenerator.js';
import MaterialGenerator from './procedural/materialGenerator.js';

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
        
        this.olam.on("heesHawvoos", (dt) => this.update(dt));
    }
    
    async initPool(type, maxInstances = 5000) {
        if (this.pools[type]) return this.pools[type];
        if (this.loadingPools.has(type)) return null;

        this.loadingPools.add(type);
        
        try {
            let geometry = null;
            let material = null;
            let baseColor = new THREE.Color(0xffffff);

            if (type.includes('flower')) {
                let modelPath = "awtsmoos://flowerBlue";
                if (type.includes('yellow')) modelPath = "awtsmoos://flowerYellow";
                else if (type.includes('white')) modelPath = "awtsmoos://flowerWhite";
                
                const actualPath = this.olam.getComponent(modelPath);
                if(actualPath) {
                    try {
                        const gltf = await this.olam.boyrayNivra({ path: actualPath });
                        if (gltf && gltf.scene) {
                            const geometries = [];
                            const materials = [];
                            
                            gltf.scene.traverse(c => {
                                if(c.isMesh) {
                                    c.updateMatrixWorld(true);
                                    const g = c.geometry.clone();
                                    g.applyMatrix4(c.matrixWorld);
                                    
                                    // B"H: Safety guard for material absence
                                    const sourceMat = c.material || this.fallbackMaterial;
                                    let matIndex = materials.indexOf(sourceMat);
                                    if (matIndex === -1) {
                                        const mClone = sourceMat.clone();
                                        mClone.side = THREE.DoubleSide; 
                                        MaterialGenerator.injectWind(mClone);
                                        materials.push(mClone);
                                        matIndex = materials.length - 1;
                                    }
                                    
                                    // B"H FIX: Calculate actual count. 'Infinity' crashes WebGLRenderer.
                                    const count = g.index ? g.index.count : g.attributes.position.count;
                                    
                                    g.clearGroups();
                                    g.addGroup(0, count, matIndex);
                                    geometries.push(g);
                                }
                            });

                            if(geometries.length > 0) {
                                geometry = BufferGeometryUtils.mergeGeometries(geometries, true);
                                material = materials;
                            }
                        }
                    } catch(e) { console.warn("B\"H: Flower load failed", e); }
                }
            } else {
                geometry = GeometryGenerator.get(type);
                material = MaterialGenerator.get(type);
                if(type.includes('grass')) baseColor.setHex(0x44aa44);
                else if(type.includes('rock')) baseColor.setHex(0x888888);
            }

            if (!geometry) {
                geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
                material = this.fallbackMaterial;
            }

            geometry.computeBoundingBox();
            const box = geometry.boundingBox;
            const size = new THREE.Vector3();
            box.getSize(size);
            const height = size.y;
            
            let targetHeight = 0.5;
            if (type.includes('rock')) targetHeight = 0.6;
            else if (type.includes('grass')) targetHeight = 0.6;
            else if (type.includes('flower')) targetHeight = 0.8;

            if (height > 0.01) {
                const scaleFactor = targetHeight / height;
                geometry.scale(scaleFactor, scaleFactor, scaleFactor);
            }
            
            geometry.computeBoundingBox();
            const center = new THREE.Vector3();
            geometry.boundingBox.getCenter(center);
            geometry.translate(-center.x, -geometry.boundingBox.min.y, -center.z);

            const instancedMesh = new THREE.InstancedMesh(geometry, material, maxInstances);
            instancedMesh.count = 0;
            instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            if(instancedMesh.instanceColor) instancedMesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
            
            instancedMesh.receiveShadow = true;
            instancedMesh.castShadow = true;
            instancedMesh.frustumCulled = false;
            
            this.olam.scene.add(instancedMesh);
            
            this.pools[type] = {
                mesh: instancedMesh,
                count: 0,
                max: maxInstances,
                material: material,
                baseColor: baseColor
            };

            return this.pools[type];
        } catch (e) {
            console.error("B\"H Nature System Critical Error:", e);
        } finally {
            this.loadingPools.delete(type);
        }
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
