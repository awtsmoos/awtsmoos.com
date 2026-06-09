// B"H
/**
 * @file lifecycle.js
 * @description Chapter 520: Entity creation now stamps performance metadata
 * onto every render child before culling, octree, or interaction registration.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Nivra from "../../nivra.js";
function isLivingNivra(nivra) { return ["chossid", "chai", "medabeir", "customNpc", "interactiveNpc"].includes(nivra?.type); }
function markLivingTree(mesh) {
    if (!mesh) return; mesh.userData ||= {}; mesh.userData.isLiving = true; mesh.userData.skipOctree = true; mesh.userData.noOctree = true;
    mesh.traverse?.(child => { child.userData ||= {}; child.userData.isLiving = true; child.userData.skipOctree = true; child.userData.noOctree = true; });
}
function fitLivingTreeToHeight(mesh, nivra) {
    if (!mesh?.isObject3D) return; mesh.userData ||= {}; if (mesh.userData.livingModelFitted) return;
    const targetHeight = Number(nivra?.visualHeight) || Number(nivra?.originalOptions?.visualHeight) || Number(nivra?.height) || 1.85;
    mesh.updateWorldMatrix(true, true); const box = new THREE.Box3().setFromObject(mesh); const size = box.getSize(new THREE.Vector3());
    if (Number.isFinite(size.y) && size.y > 0.001 && targetHeight > 0) { const scalar = targetHeight / size.y; if (Number.isFinite(scalar) && scalar > 0.00001 && scalar < 1000) mesh.scale.multiplyScalar(scalar); }
    mesh.updateWorldMatrix(true, true); const fittedBox = new THREE.Box3().setFromObject(mesh); const rootY = mesh.getWorldPosition(new THREE.Vector3()).y; const offset = rootY - fittedBox.min.y;
    mesh.userData.visualGroundOffsetY = Number.isFinite(offset) ? offset : 0; mesh.userData.livingModelFitted = true;
}
function applyPerfToTree(nivra) {
    if (!nivra?.mesh) return;
    nivra.applyPerformanceUserData?.(nivra.mesh);
    nivra.mesh.traverse?.(child => { nivra.applyPerformanceUserData?.(child); if (nivra.cullRadius && child.isMesh) child.frustumCulled = true; });
}
function collectMaterials(nivra) {
    nivra.mesh?.traverse(child => {
        if (!child.isMesh) return;
        if (child.geometry?.boundingBox) { const size = new THREE.Vector3(); child.geometry.boundingBox.getSize(size); if (size.x > 300 || size.z > 300) child.frustumCulled = false; }
        if (!child.material) return;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(m => { m.visible = true; if (m.name && nivra.materials) nivra.materials[m.name] = m; });
    });
}
export default {
    async heescheel(olam, info) {
        this.olam = olam; await Nivra.prototype.heescheel.call(this, olam); if (this.isTemplate) return true;
        try {
            const threeObj = await olam.boyrayNivra(this, info); if (!threeObj) throw new Error(`boyrayNivra returned null for "${this.name}"`);
            this.mesh = threeObj.scene || threeObj; if (threeObj.animations) this.animations = threeObj.animations;
            if (this.mesh) { this.mesh.nivraAwtsmoos = this; this.animationMixer = new THREE.AnimationMixer(this.mesh); this.getChaweeyoos(); applyPerfToTree(this); collectMaterials(this); }
            if (this.position) this.mesh.position.copy(this.position.vector3()); if (this.rotation) this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z); if (this.scale) this.mesh.scale.copy(this.scale.vector3());
            this.mesh.updateMatrixWorld(true); await olam.hoyseef(this); this.mesh.visible = this.visible;
            const isLiving = isLivingNivra(this);
            if (isLiving) { fitLivingTreeToHeight(this.mesh, this); markLivingTree(this.mesh); }
            else if (this.isSolid && olam.worldOctree) olam.worldOctree.addObject(this.mesh);
            if (this.interactable && !isLiving && olam.interactiveOctree) { if (this.mesh?.isMesh && this.mesh?.geometry) olam.interactiveOctree.addObject(this.mesh); else if (olam.interactiveOctree.fromGraphNode) olam.interactiveOctree.fromGraphNode(this.mesh); }
            return true;
        } catch(e) { console.error(`B"H - 🚨 [${this.name}] FATAL ERROR in heescheel:`, e); throw e; }
    },
    moveMeshToSceneRetainPosition(mesh = null) { const target = mesh || this.mesh, scene = this.olam ? this.olam.scene : null; if (!scene || !target) return; target.updateMatrixWorld(true); const position = new THREE.Vector3(), quaternion = new THREE.Quaternion(), scale = new THREE.Vector3(); target.matrixWorld.decompose(position, quaternion, scale); if (target.parent) target.parent.remove(target); scene.add(target); target.position.copy(position); target.quaternion.copy(quaternion); target.scale.copy(scale); target.updateMatrix(); },
    setMesh(mesh) { this.mesh = mesh; this.mesh.nivraAwtsmoos = this; this.applyPerformanceUserData?.(this.mesh); },
    async sealayk() { if (this.mesh?.parent) this.mesh.parent.remove(this.mesh); this.ayshPeula("sealayk"); }
};
