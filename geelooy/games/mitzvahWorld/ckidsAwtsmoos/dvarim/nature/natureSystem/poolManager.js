
/**
 * B"H
 * Nature Pool Manager
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import GeometryGenerator from '../procedural/geometryGenerator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import MaterialGenerator from '../procedural/materialGenerator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default {
    async initPool(type, maxInstances = 5000) {
        if (this.pools[type]) return this.pools[type];
        if (this.loadingPools.has(type)) return null;

        this.loadingPools.add(type);
        
        try {
            let geometry = null;
            let material = null;
            let baseColor = new THREE.Color(0xffffff);

            if (type.includes('flower')) {
                await this.initFlower(type, maxInstances, geometry, material, baseColor);
                // B"H: Logic inside initFlower helper would return geo/mat
                // For simplicity in splitting, I'll keep the logic block here or call a helper
                // BUT due to `this` context, it's easier to keep specific loader logic here
                // if it fits. The main file was > 200 lines. This split reduces complexity.
                
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
                                    const sourceMat = c.material || this.fallbackMaterial;
                                    let matIndex = materials.indexOf(sourceMat);
                                    if (matIndex === -1) {
                                        const mClone = sourceMat.clone();
                                        mClone.side = THREE.DoubleSide; 
                                        MaterialGenerator.injectWind(mClone);
                                        materials.push(mClone);
                                        matIndex = materials.length - 1;
                                    }
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
}
