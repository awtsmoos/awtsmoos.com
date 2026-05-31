// B"H
/**
 * @file handlers/world.js
 * @description
 * Chapter 89: the worker/world bridge learns clean dissolution. The Awtsmoos
 * tells each mesh, geometry, material, texture, octree echo, and animation loop
 * to return to ayin before the next chamber is born. The worker is not slain;
 * only the current world-body is unloaded and acknowledged.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import VeilController from "../../uiManager/logic/VeilController.js";

/** @param {any} value Maybe array. @returns {Array} */
function asArray(value) { return Array.isArray(value) ? value : value ? [value] : []; }

/** @param {any} material Three material. @returns {void} */
function disposeMaterial(material) {
  for (const one of asArray(material)) {
    if (!one) continue;
    Object.values(one).forEach(value => value?.isTexture && value.dispose?.());
    one.dispose?.();
  }
}

/** @param {any} mesh Three object. @returns {void} */
function disposeMesh(mesh) {
  if (!mesh) return;
  mesh.traverse?.(child => {
    child.geometry?.dispose?.();
    disposeMaterial(child.material);
  });
  mesh.geometry?.dispose?.();
  disposeMaterial(mesh.material);
  mesh.parent?.remove?.(mesh);
}

/** @param {any} olam Active world instance. @returns {number} */
function disposeOlamVessels(olam) {
  let count = 0;
  for (const nivra of asArray(olam?.nivrayim)) {
    disposeMesh(nivra?.mesh || nivra?.model || nivra?.object3D);
    nivra?.mixer?.stopAllAction?.();
    nivra?.ayshPeula?.("destroy");
    count += 1;
  }
  olam?.scene?.traverse?.(object => disposeMesh(object));
  olam?.renderer?.renderLists?.dispose?.();
  olam?.worldOctree?.clear?.();
  if (Array.isArray(olam?.nivrayim)) olam.nivrayim.length = 0;
  return count;
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

    destroyWorld() {
      let disposed = 0;
      try {
        if (manager.olam) {
          manager.olam.ayshPeula?.("destroy");
          disposed = disposeOlamVessels(manager.olam);
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
