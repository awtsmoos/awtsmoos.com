// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js';
import GeometryGenerator from '../procedural/geometryGenerator.js';
import MaterialGenerator from '../procedural/materialGenerator.js';

export default {
    async initPool(type, maxInstances, olam, pools, fallbackMaterial) {
        try {
            let geometry = null;
            let material = null;
            let baseColor = new THREE.Color(0xffffff);

            // B"H: Determine Model Path based on type
            let modelPath = null;
            if (type.includes('flower')) {
                if (type.includes('yellow')) modelPath = "awtsmoos://flowerYellow";
                else if (type.includes('white')) modelPath = "awtsmoos://flowerWhite";
                else modelPath = "awtsmoos://flowerBlue";
            } else if (type.includes('grass')) {
                modelPath = "awtsmoos://grassModel";
            }
            // B"H: Bush logic removed - using procedural fallback

            // B"H: Attempt to load GLB if path exists
            if (modelPath) {
                const actualPath = olam.getComponent(modelPath);
                if(actualPath) {
                    try {
                        const gltf = await olam.boyrayNivra({ path: actualPath });
                        if (gltf && gltf.scene) {
                            const geometries = [];
                            const materials = [];
                            
                            gltf.scene.traverse(c => {
                                if(c.isMesh) {
                                    c.updateMatrixWorld(true);
                                    const g = c.geometry.clone();
                                    g.applyMatrix4(c.matrixWorld);
                                    
                                    let matIndex = materials.indexOf(c.material);
                                    if (matIndex === -1) {
                                        const mClone = c.material.clone();
                                        mClone.side = THREE.DoubleSide; 
                                        MaterialGenerator.injectWind(mClone);
                                        materials.push(mClone);
                                        matIndex = materials.length - 1;
                                    }
                                    
                                    if (!g.index) {
                                         // B"H: Merge logic requires indices
                                    }

                                    const count = g.attributes.position.count;
                                    g.clearGroups();
                                    g.addGroup(0, Infinity, matIndex);
                                    geometries.push(g);
                                }
                            });

                            if(geometries.length > 0) {
                                geometry = BufferGeometryUtils.mergeGeometries(geometries, true);
                                material = materials;
                            }
                        }
                    } catch(e) {
                        console.warn("B\"H: GLB load failed for " + type + ", falling back to procedural.", e);
                    }
                }
            }

            // Fallback to Procedural if no GLB or GLB failed
            if (!geometry) {
                geometry = GeometryGenerator.get(type);
                material = MaterialGenerator.get(type);
                if(type.includes('grass')) baseColor.setHex(0x44aa44);
                else if(type.includes('rock')) baseColor.setHex(0x888888);
            }

            if (!geometry) {
                geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
                material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
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
            else if (type.includes('bush')) targetHeight = 1.0;

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
            
            olam.scene.add(instancedMesh);
            
            pools[type] = {
                mesh: instancedMesh,
                count: 0,
                max: maxInstances,
                material: material,
                baseColor: baseColor
            };

            return pools[type];
        } catch (e) {
            console.error("B\"H Nature System Critical Error:", e);
            return null;
        }
    }
}