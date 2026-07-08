// B"H
/**
 * @file AwtsmoosThreeManifestor.js
 * @description
 * THE CHARIOT OF EMANATION.
 * Translates pure JSON Divine Will into physical THREE.js vessels.
 * Built with absolute extreme fallbacks to prevent any runtime shattering.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class AwtsmoosThreeManifestor {
    /**
     * @param {Object} blueprint Pure JSON describing the existence of the entity.
     * @returns {THREE.Object3D} The manifested physical vessel.
     */
    static emanate(blueprint) {
        try {
            if (!blueprint || typeof blueprint !== 'object') {
                return this._createFallbackVessel();
            }

            // 1. Forge Geometry
            let geometry = this._forgeGeometry(blueprint.geometry);
            
            // 2. Forge Material
            let material = this._forgeMaterial(blueprint.material);

            // 3. Assemble Mesh
            let mesh;
            if (blueprint.instanced && blueprint.instanced.count > 0) {
                // Determine if geometry is buffer geometry
                let instancedGeo = new THREE.InstancedBufferGeometry();
                if (geometry) {
                    instancedGeo.copy(geometry);
                }
                instancedGeo.instanceCount = blueprint.instanced.count;
                mesh = new THREE.Mesh(instancedGeo, material);
                
                // Apply instance matrices
                this._applyInstancing(instancedGeo, blueprint.instanced);
            } else {
                mesh = new THREE.Mesh(geometry, material);
            }

            // 4. Apply general properties
            if (blueprint.name) mesh.name = blueprint.name;
            if (blueprint.frustumCulled !== undefined) mesh.frustumCulled = blueprint.frustumCulled;

            return mesh;

        } catch (e) {
            console.warn("B\"H - AwtsmoosThreeManifestor: Reality shattered during emanation. Deploying Chesed (mercy) fallback.", e);
            return this._createFallbackVessel();
        }
    }

    static _forgeGeometry(geoData) {
        if (!geoData) return new THREE.BufferGeometry();
        try {
            let geometry;
            const args = geoData.args || [];
            
            // Seder Hishtalshelus mapping of geometries
            const geoMap = {
                "PlaneGeometry": () => new THREE.PlaneGeometry(...args),
                "BoxGeometry": () => new THREE.BoxGeometry(...args),
                "SphereGeometry": () => new THREE.SphereGeometry(...args)
            };

            if (geoMap[geoData.type]) {
                geometry = geoMap[geoData.type]();
            } else {
                geometry = new THREE.BufferGeometry();
            }

            // Apply data-driven modifiers
            if (geoData.modifiers && Array.isArray(geoData.modifiers)) {
                geoData.modifiers.forEach(mod => {
                    if (!mod) return;
                    if (mod.type === "curveVertices") {
                        const posAttr = geometry.attributes.position;
                        if (posAttr) {
                            for (let i = 0; i < posAttr.count; i++) {
                                let depVal = mod.dependency === 'y' ? posAttr.getY(i) : posAttr.getX(i);
                                let currentVal = mod.axis === 'z' ? posAttr.getZ(i) : posAttr.getY(i);
                                let newVal = currentVal + (depVal * depVal * (mod.factor || 0.5));
                                
                                if (mod.axis === 'z') posAttr.setZ(i, newVal);
                                else if (mod.axis === 'y') posAttr.setY(i, newVal);
                                else posAttr.setX(i, newVal);
                            }
                        }
                    } else if (mod.type === "computeVertexNormals") {
                        geometry.computeVertexNormals();
                    }
                });
            }
            return geometry;
        } catch (e) {
            console.warn("B\"H - Geometry forging failed.", e);
            return new THREE.BufferGeometry();
        }
    }

    static _forgeMaterial(matData) {
        if (!matData) return new THREE.MeshBasicMaterial({ color: 0xff00ff });
        try {
            const args = matData.args || {};
            
            // Convert string sides to THREE constants safely
            if (args.side === "DoubleSide") args.side = THREE.DoubleSide;
            else if (args.side === "BackSide") args.side = THREE.BackSide;
            else args.side = THREE.FrontSide;

            const matMap = {
                "ShaderMaterial": () => new THREE.ShaderMaterial(args),
                "MeshBasicMaterial": () => new THREE.MeshBasicMaterial(args),
                "MeshStandardMaterial": () => new THREE.MeshStandardMaterial(args)
            };

            if (matMap[matData.type]) {
                return matMap[matData.type]();
            }
            return new THREE.MeshBasicMaterial({ color: 0xff00ff });
        } catch (e) {
            console.warn("B\"H - Material forging failed.", e);
            return new THREE.MeshBasicMaterial({ color: 0xff00ff });
        }
    }

    static _applyInstancing(instancedGeo, instanceData) {
        try {
            const count = instanceData.count || 1;
            const dist = instanceData.distribution || {};
            
            const dummy = new THREE.Object3D();
            const matrixArray = new Float32Array(count * 16);

            for (let i = 0; i < count; i++) {
                if (dist.type === "radial") {
                    const r = Math.random() * (dist.radius || 10);
                    const theta = Math.random() * Math.PI * 2;
                    const x = Math.cos(theta) * r;
                    const z = Math.sin(theta) * r;
                    
                    dummy.position.set(x, dist.yOffset || 0, z);
                    
                    const rotRange = dist.rotationRange || [0, 0];
                    dummy.rotation.set(0, rotRange[0] + Math.random() * (rotRange[1] - rotRange[0]), 0);
                    
                    const scaleRange = dist.scaleRange || [1, 1];
                    const s = scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0]);
                    dummy.scale.set(s, s, s);
                }

                dummy.updateMatrix();
                dummy.matrix.toArray(matrixArray, i * 16);
            }

            instancedGeo.setAttribute('instanceMatrix', new THREE.InstancedBufferAttribute(matrixArray, 16));
        } catch (e) {
            console.warn("B\"H - Instancing logic failed.", e);
        }
    }

    static _createFallbackVessel() {
        // Absolute fallback: an invisible empty object to prevent null reference crashes
        const obj = new THREE.Object3D();
        obj.name = "AwtsmoosFallbackVessel";
        return obj;
    }
}
