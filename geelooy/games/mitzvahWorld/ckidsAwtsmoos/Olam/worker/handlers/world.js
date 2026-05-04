
// B"H
/**
 * @file handlers/world.js
 * @description
 * 🌍 CHAPTER 6: THE COMMANDS OF THE KINGSHIP (MALCHUS) 🌍
 * 
 * "A king's decree is a wall that cannot be breached." 
 * 
 * This module catches the signals arriving from the Worker (the laboring Angel)
 * and manifests them as physical events in the Main Thread.
 * 
 * THE TIKKUN OF THE BLACK SCREEN:
 * Previously, the handlers for "loadedWorld" and "game started" merely logged 
 * their arrival, but took NO physical action to reveal the world. Now, they 
 * invoke the supreme VeilController to tear the curtain and reveal the Light!
 */

import LocalDatabase from "../../../utils/LocalDatabase.js";
import * as THREE from '/games/scripts/build/three.module.js';
import VeilController from "../../uiManager/logic/VeilController.js";

/**
 * @function worldHandlers
 * @param {OlamWorkerManager} manager 
 */
export default function worldHandlers(manager) {
    const { eved, myUi } = manager;

    return {
        /**
         * @function loadedWorld
         * @description The World has reached 100% manifestation in the worker's thread.
         */
        async loadedWorld(payload) {
            // B"H: silent

            
            try {
                // 1. Give the canvas to the worker so it can start the render heartbeat
                await manager.tawfeekim.heescheel();
                
                // 2. Tear the veil immediately! No waiting for another heartbeat.
                // B"H: silent

                VeilController.lift();

                // 3. Populate the menu systems
                if (manager._managerOfAllWorlds && manager._managerOfAllWorlds.uiManager) {
                    manager._managerOfAllWorlds.uiManager.makeGameMenu();
                }
            } catch(e) {
                console.error("B\"H - 🚨 World instantiation crashed at the threshold:", e);
            }
        },

        /**
         * @function game started
         * @description The final pulse before the engine takes control.
         */
        "game started": async function(payload) {
            // B"H: silent

            
            // B"H: Relentless pursuit of visibility! 
            // In some dimensions, loadedWorld is the trigger, in others, game started. 
            // We satisfy both to ensure NO soul is left in darkness.
            VeilController.lift();
        },

        async switchWorlds(data) {
            // B"H: silent

            if (manager._managerOfAllWorlds && typeof manager._managerOfAllWorlds.switchWorlds === 'function') {
                await manager._managerOfAllWorlds.switchWorlds(data);
            }
        },

        destroyWorld() {
            // B"H: silent

            if (manager.olam) {
                manager.olam.ayshPeula("destroy");
                if (eved) eved.postMessage({ destroyed: true });
            }
        },

        async updateObjectTransform(data) {
            const { id, type, axis, value } = data || {};
            if (!manager.olam || !id) return;

            const obj = manager.olam.nivrayim.find(n => n.id === id);
            if (obj && obj.mesh) {
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
            if (manager.olam) {
                const obj = manager.olam.nivrayim.find(n => n.id === id);
                if (obj) manager.olam.sealayk(obj);
            }
        },

        async duplicateObject(id) {
            if (!manager.olam) return;
            const obj = manager.olam.nivrayim.find(n => n.id === id);
            if (obj) {
                const newPos = obj.mesh.position.clone().add(new THREE.Vector3(2, 0, 2));
                const options = {
                    ...obj.originalOptions,
                    position: newPos,
                    name: obj.name + "_copy_" + Date.now()
                };
                manager.olam.addObject(obj.constructor.name, options);
            }
        },

        toolAltAction(item) {
            if (!item || !manager.olam) return;
            if (item.className === 'ElementalStaff') {
                if (!item.customData) item.customData = {};
                const modes = ['fire', 'water', 'air', 'earth'];
                let idx = (item.customData.modeIndex || 0 + 1) % modes.length;
                item.customData.modeIndex = idx;
                
                manager.olam.ayshPeula("ui event", "effectsOverlay", { 
                    text: `Staff Mode: ${modes[idx].toUpperCase()}`, 
                    color: "#ffffff" 
                });
            }
        }
    };
}
