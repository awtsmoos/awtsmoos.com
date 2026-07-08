// B"H
/**
 * @file Ghost.js
 * @description Chapter 1026: build preview never imports removed tree generators.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
function simpleGhost(color = 0x00ff00, size = [1,1,1]) { return new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: .5, depthWrite: false })); }
export default {
  async placeBlockOnRay() {
    if (this._isGeneratingGhost || !this.activeRay?.group) return;
    this._isGeneratingGhost = true;
    try {
      this.activeRay.group.clear(); this.activeRay.group.add(this.activeRay.visual); this.removeActiveObject();
      const item = this.getActiveItem(); if (!item || (!item.isBuildable && !item.isPainter)) return;
      let blockDefinition = null, itemData = { ...item }, mesh = null;
      try {
        if (item.className === "CustomNpc") { const gltf = await this.olam.boyrayNivra({ path: item.customData?.modelPath || "awtsmoos://awduhm", isSolid: false, name: "ghost_npc" }); mesh = gltf?.scene || gltf || null; blockDefinition = {}; }
        else if (item.className === "VillageHeroTree" || item.className === "TreeSeed") mesh = simpleGhost(0x39ff68, [2,7,2]);
        else if (item.isPainter) { const type = item.natureType || 'grass'; if (type.includes('rock') || type.includes('grass')) { const geomMod = await import('../../../../dvarim/nature/procedural/geometryGenerator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1'); mesh = new THREE.Mesh(geomMod.default.get(type), new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, transparent: true, opacity: .45 })); } else { const result = await this.olam.boyrayNivra({ path: type.includes('flower') ? "awtsmoos://flowerBlue" : "awtsmoos://grassModel", isSolid: false, name: "ghost_nature" }); mesh = result?.scene || result || null; } }
        else { try { const fileName = item.className.toLowerCase() + ".js", mod = await import(`../../../../dvarim/${fileName}`), temp = new mod.default(item); blockDefinition = temp.originalOptions?.golem; } catch {} if (!blockDefinition) blockDefinition = { guf: { BoxGeometry: [1,1,1] }, toyr: { MeshLambertMaterial: { color: "#a0522d" } } }; mesh = await this.olam.generateThreeJsMesh(blockDefinition); }
      } catch(e) { console.warn("B\"H: ghost preview failed", item.name, e); }
      if (!mesh) mesh = simpleGhost(0xff00ff, [.5,.5,.5]);
      mesh.traverse?.(c => { if (!c.isMesh || !c.material) return; const mats = Array.isArray(c.material) ? c.material : [c.material]; mats.forEach(mat => { mat.transparent = true; mat.opacity = item.isPainter ? (this.isPaintingMode ? .8 : .3) : .6; mat.depthWrite = false; if (item.isPainter) { mat.color?.setHex?.(this.isPaintingMode ? 0x00ff00 : 0xff0000); mat.wireframe = !this.isPaintingMode; } }); });
      mesh.awtsmoosGolem = blockDefinition; mesh.userData.itemData = itemData; this.activeObject = { mesh }; this.activeObject.mesh.position.z = isNaN(this.distanceFromRay) ? 5 : this.distanceFromRay; this.activeRay.group.add(this.activeObject.mesh); this.alignObject();
    } catch(e) { console.error("B\"H Error in placeBlockOnRay:", e); }
    finally { this._isGeneratingGhost = false; }
  }
};
