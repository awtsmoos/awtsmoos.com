// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js';
import GeometryGenerator from '../procedural/geometryGenerator.js';
import MaterialGenerator from '../procedural/materialGenerator.js';
function isGrass(type) { return String(type || '').toLowerCase().includes('grass'); }
function forceGrassMaterial(material) {
    const make = m => {
        const out = m?.clone?.() || new THREE.MeshLambertMaterial();
        out.side = THREE.DoubleSide;
        out.transparent = Boolean(out.transparent);
        out.alphaTest = Math.max(Number(out.alphaTest || 0), 0.25);
        out.color ||= new THREE.Color(0xffffff);
        out.color.setHex(0x4fd15a);
        if ('emissive' in out) out.emissive.setHex(0x102a10);
        if ('roughness' in out) out.roughness = 0.78;
        if ('metalness' in out) out.metalness = 0;
        out.needsUpdate = true;
        return out;
    };
    return Array.isArray(material) ? material.map(make) : make(material);
}
function modelPathFor(type) {
    if (type.includes('flower')) {
        if (type.includes('yellow')) return 'awtsmoos://flowerYellow';
        if (type.includes('white')) return 'awtsmoos://flowerWhite';
        return 'awtsmoos://flowerBlue';
    }
    if (type.includes('grass')) return 'awtsmoos://grassModel';
    return null;
}
async function mergedModel(type, olam) {
    const modelPath = modelPathFor(type);
    if (!modelPath) return null;
    const actualPath = olam.getComponent(modelPath);
    if (!actualPath) return null;
    const gltf = await olam.boyrayNivra({ path: actualPath });
    if (!gltf?.scene) return null;
    const geometries = [], materials = [];
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse(c => {
        if (!c.isMesh || !c.geometry) return;
        c.updateMatrixWorld(true);
        const g = c.geometry.clone();
        g.applyMatrix4(c.matrixWorld);
        const srcMat = isGrass(type) ? forceGrassMaterial(c.material) : (c.material?.clone?.() || new THREE.MeshLambertMaterial({ color:0xffffff }));
        const idx = materials.push(srcMat) - 1;
        g.clearGroups();
        g.addGroup(0, Infinity, idx);
        geometries.push(g);
    });
    if (!geometries.length) return null;
    return { geometry:BufferGeometryUtils.mergeGeometries(geometries, true), material:materials };
}
function fallback(type) {
    const geometry = GeometryGenerator.get(type) || new THREE.BoxGeometry(0.5, 0.5, 0.5);
    let material = MaterialGenerator.get(type) || new THREE.MeshLambertMaterial({ color:0x55cc55 });
    if (isGrass(type)) material = forceGrassMaterial(material);
    return { geometry, material };
}
function normalizeGeometry(type, geometry) {
    geometry.computeBoundingBox();
    const size = new THREE.Vector3();
    geometry.boundingBox.getSize(size);
    const height = size.y;
    let targetHeight = 0.5;
    if (type.includes('rock')) targetHeight = 0.6;
    else if (type.includes('grass')) targetHeight = 0.42;
    else if (type.includes('flower')) targetHeight = 0.65;
    else if (type.includes('bush')) targetHeight = 1.0;
    if (height > 0.01) {
        const scaleFactor = targetHeight / height;
        geometry.scale(scaleFactor, scaleFactor, scaleFactor);
    }
    geometry.computeBoundingBox();
    const center = new THREE.Vector3();
    geometry.boundingBox.getCenter(center);
    geometry.translate(-center.x, -geometry.boundingBox.min.y, -center.z);
}
export default {
    async initPool(type, maxInstances, olam, pools, fallbackMaterial) {
        try {
            let source = null;
            try { source = await mergedModel(type, olam); } catch(e) { console.warn('B"H: GLB load failed for ' + type + ', falling back to procedural.', e); }
            if (!source) source = fallback(type);
            const geometry = source.geometry;
            const material = isGrass(type) ? forceGrassMaterial(source.material || fallbackMaterial) : (source.material || fallbackMaterial || new THREE.MeshLambertMaterial({ color:0x888888 }));
            normalizeGeometry(type, geometry);
            const instancedMesh = new THREE.InstancedMesh(geometry, material, maxInstances);
            instancedMesh.count = 0;
            instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            if (instancedMesh.instanceColor) instancedMesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
            instancedMesh.receiveShadow = !isGrass(type);
            instancedMesh.castShadow = !isGrass(type);
            instancedMesh.frustumCulled = false;
            Object.assign(instancedMesh.userData ||= {}, { vegetationPool:true, natureType:type, skipOctree:true, noOctree:true, addToOctree:false });
            olam.scene.add(instancedMesh);
            pools[type] = { mesh:instancedMesh, count:0, max:maxInstances, material, baseColor:new THREE.Color(isGrass(type) ? 0x4fd15a : type.includes('rock') ? 0x888888 : 0xffffff) };
            return pools[type];
        } catch (e) {
            console.error('B"H Nature System Critical Error:', e);
            return null;
        }
    }
};
