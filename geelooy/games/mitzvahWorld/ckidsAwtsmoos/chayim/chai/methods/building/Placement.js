// B"H
/**
 * @file Placement.js
 * @description Chapter 1027: tree placement now resolves to VillageHeroTree only.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export default {
  async placeObject() {
    if (!this.activeObject?.mesh) return;
    const activeItem = this.getActiveItem(); if (!activeItem?.isBuildable) return;
    const mesh = this.activeObject.mesh; mesh.updateMatrixWorld(true);
    const worldPosition = new THREE.Vector3(), worldQuaternion = new THREE.Quaternion(), worldScale = new THREE.Vector3();
    mesh.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale);
    const worldRotation = new THREE.Euler().setFromQuaternion(worldQuaternion);
    this.inventory.consumeItem(activeItem, 1);
    if (activeItem.className === "CustomNpc") await this.olam.loadNivrayim({ CustomNpc: [{ ...activeItem, position: worldPosition, rotation: worldRotation, isSolid: false }] });
    else if (activeItem.className === "VillageHeroTree" || activeItem.className === "TreeSeed") await this.olam.loadNivrayim({ VillageHeroTree: [{ ...activeItem, position: worldPosition, rotation: worldRotation, scale: worldScale, isSolid: false, useAuthoredY: true }] });
    else await this.olam.addObject(activeItem.className || 'Domem', { position: worldPosition, scale: worldScale, rotation: worldRotation, golem: mesh.awtsmoosGolem, itemData: activeItem, ...(activeItem.dimensions ? { dimensions: activeItem.dimensions } : {}), isSolid: true, interactable: true, name: "BH_permanent_block_" + Date.now() });
    this.spawnHebrewParticles(worldPosition); this.playSound("awtsmoos://placeSound", { volume: .5 });
    if (!this.getActiveItem()) this.removeRay(); else { this.removeActiveObject(); this.placeBlockOnRay(); }
  }
};
