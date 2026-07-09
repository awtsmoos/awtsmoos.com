// B"H
/**
 * @file handlers/world.js
 * @description
 * Chapter 89: the worker/world bridge learns clean dissolution. The Awtsmoos
 * tells each mesh, geometry, material, texture, octree echo, and animation loop
 * to return to ayin before the next chamber is born. The worker is not slain;
 * only the current world-body is unloaded and acknowledged.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import VeilController from "../../uiManager/logic/VeilController.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/** @param {any} value Maybe array. @returns {Array} A normalized array. */
function asArray(value) { return Array.isArray(value) ? value : value ? [value] : []; }

/** @returns {Promise<void>} One browser task boundary for a visible progress frame. */
function breathe() { return new Promise(resolve => setTimeout(resolve, 0)); }

/** @param {any} resource Three resource. @returns {boolean} Whether it survives world replacement. */
function isPersistent(resource) {
  return Boolean(resource?.userData?.worldPersistentAsset || resource?.userData?.sharedVillageAnimalGeometry);
}

/**
 * Collects every disposable GPU resource exactly once. Like letters gathered
 * before a new sentence, no geometry is counted twice and no shared atlas is
 * erased while the same worker still remembers it.
 *
 * @param {any} olam Active world.
 * @returns {{geometries:Set<any>,materials:Set<any>,textures:Set<any>}} Unique resources.
 */
function collectWorldResources(olam) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  const visit = object => {
    if (object?.geometry && !isPersistent(object.geometry)) geometries.add(object.geometry);
    for (const material of asArray(object?.material)) {
      if (!material || isPersistent(material)) continue;
      materials.add(material);
      for (const value of Object.values(material)) {
        if (value?.isTexture && !isPersistent(value)) textures.add(value);
      }
    }
  };
  olam?.scene?.traverse?.(visit);
  for (const nivra of asArray(olam?.nivrayim)) {
    const root = nivra?.mesh || nivra?.model || nivra?.object3D;
    if (root && !root.parent) root.traverse?.(visit);
  }
  for (const texture of [olam?.scene?.background, olam?.scene?.environment]) {
    if (texture?.isTexture && !isPersistent(texture)) textures.add(texture);
  }
  return { geometries, materials, textures };
}

/** @param {Set<any>} resources Unique resources. @param {number} chunk Batch size. @returns {Promise<void>} */
async function disposeInChunks(resources, chunk = 80) {
  let index = 0;
  for (const resource of resources) {
    resource?.dispose?.();
    index += 1;
    if (index % chunk === 0) await breathe();
  }
}

/** @param {any} manager Worker manager. @param {string} text Progress copy. @param {number} percent Percent. */
function reportCleanup(manager, text, percent) {
  const ui = manager?._managerOfAllWorlds?.ui;
  ui?.htmlAction?.({ shaym: "action loading", properties: { innerHTML: text } });
  ui?.htmlAction?.({ shaym: "loadingBar", style: { width: `${percent}%` } });
}

/** @param {any} manager Worker manager. @param {any} olam Active world. @returns {Promise<number>} Disposed entity count. */
async function disposeOlamVessels(manager, olam) {
  const nivrayim = asArray(olam?.nivrayim);
  reportCleanup(manager, "Gathering the old world...", 32);
  const resources = collectWorldResources(olam);
  olam.__renderInFlight = true;
  olam.ayshPeula?.("destroy");
  olam.combatManager?.dispose?.();
  for (let index = 0; index < nivrayim.length; index += 1) {
    const nivra = nivrayim[index];
    nivra?.mixer?.stopAllAction?.();
    nivra?.ayshPeula?.("destroy");
    if (index > 0 && index % 50 === 0) await breathe();
  }
  olam?.scene?.clear?.();
  olam?.worldOctree?.clear?.();
  if (Array.isArray(olam?.nivrayim)) olam.nivrayim.length = 0;
  reportCleanup(manager, "Releasing geometry...", 48);
  await disposeInChunks(resources.geometries);
  reportCleanup(manager, "Releasing materials...", 60);
  await disposeInChunks(resources.materials);
  reportCleanup(manager, "Releasing textures...", 70);
  await disposeInChunks(resources.textures, 40);
  olam?.renderer?.renderLists?.dispose?.();
  await breathe();
  return nivrayim.length;
}

/**
 * @function worldHandlers
 * @param {OlamWorkerManager} manager
 * Main-thread worker manager.
 *
 * @returns {object}
 * Message handlers.
 */
export default function worldHandlers(manager) {
  const { eved } = manager;
  return {
    async loadedWorld(payload) {
      try {
        await manager.tawfeekim.heescheel();
        VeilController.lift();
        if (manager._managerOfAllWorlds?.uiManager) manager._managerOfAllWorlds.uiManager.makeGameMenu();
        manager._worldLoaded = true;
        manager.runtime.worldLoaded = true;
      } catch (e) {
        console.error("B\"H - World instantiation crashed at the threshold:", e);
      }
    },

    "game started": async function gameStarted(payload) { VeilController.lift(); },

    async switchWorlds(data) {
      if (typeof manager._managerOfAllWorlds?.switchWorlds === "function") await manager._managerOfAllWorlds.switchWorlds(data);
    },

    async destroyWorld() {
      let disposed = 0;
      try {
        if (manager.olam) {
          const activeWorld = manager.olam;
          disposed = await disposeOlamVessels(manager, activeWorld);
          manager.olam = null;
        }
      } catch (error) {
        console.warn("B\"H - World cleanup warning:", error);
      } finally {
        manager._worldLoaded = false;
        if (manager.runtime) manager.runtime.worldLoaded = false;
        eved?.postMessage?.({ destroyed: true, disposed });
      }
    },

    async updateObjectTransform(data) {
      const { id, type, axis, value } = data || {};
      if (!manager.olam || !id) return;
      const obj = manager.olam.nivrayim.find(n => n.id === id);
      if (obj?.mesh) {
        if (type === 'position') obj.mesh.position[axis] = value;
        if (type === 'rotation') obj.mesh.rotation[axis] = value;
        if (type === 'scale') obj.mesh.scale[axis] = value;
        obj.mesh.updateMatrixWorld(true);
        if (obj.isSolid) {
          manager.olam.worldOctree.removeMesh(obj.mesh);
          manager.olam.worldOctree.addObject(obj.mesh);
        }
      }
    },

    async deleteObject(id) {
      if (!manager.olam) return;
      const obj = manager.olam.nivrayim.find(n => n.id === id);
      if (obj) manager.olam.sealayk(obj);
    },

    async duplicateObject(id) {
      if (!manager.olam) return;
      const obj = manager.olam.nivrayim.find(n => n.id === id);
      if (!obj) return;
      const newPos = obj.mesh.position.clone().add(new THREE.Vector3(2, 0, 2));
      manager.olam.addObject(obj.constructor.name, { ...obj.originalOptions, position: newPos, name: obj.name + "_copy_" + Date.now() });
    },

    toolAltAction(item) {
      if (!item || !manager.olam || item.className !== 'ElementalStaff') return;
      item.customData ||= {};
      const modes = ['fire', 'water', 'air', 'earth'];
      const idx = ((item.customData.modeIndex || 0) + 1) % modes.length;
      item.customData.modeIndex = idx;
      manager.olam.ayshPeula("ui event", "effectsOverlay", { text: `Staff Mode: ${modes[idx].toUpperCase()}`, color: "#ffffff" });
    }
  };
}
