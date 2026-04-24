
/**
 * B"H
 * World Logic Handlers (Worker Side)
 */
import LocalDatabase from "../../../utils/LocalDatabase.js";
import * as THREE from '/games/scripts/build/three.module.js';

export default function worldHandlers(manager) {
    const { eved, myUi } = manager;

    return {
        destroyWorld() {
             if(manager.olam) {
                 manager.olam.ayshPeula("destroy");
                 if(eved) eved.postMessage({ destroyed: true });
             }
        },
        
        // ... downloadWorld ... (omitted for brevity, keep existing)

        async updateObjectTransform(data) {
            const { id, type, axis, value } = data;
            const obj = manager.olam.nivrayim.find(n => n.id === id);
            if (obj && obj.mesh) {
                if (type === 'position') obj.mesh.position[axis] = value;
                if (type === 'rotation') obj.mesh.rotation[axis] = value;
                if (type === 'scale') obj.mesh.scale[axis] = value;
                
                obj.mesh.updateMatrixWorld(true);
                
                // Update Physics if Solid
                if (obj.isSolid) {
                    manager.olam.worldOctree.removeMesh(obj.mesh);
                    manager.olam.worldOctree.addObject(obj.mesh);
                }
            }
        },
        
        async deleteObject(id) {
             const obj = manager.olam.nivrayim.find(n => n.id === id);
             if (obj) manager.olam.sealayk(obj);
        },
        
        async duplicateObject(id) {
             const obj = manager.olam.nivrayim.find(n => n.id === id);
             if (obj) {
                 const newPos = obj.mesh.position.clone().add(new THREE.Vector3(2,0,2));
                 const options = { ...obj.originalOptions, position: newPos, name: obj.name + "_copy_" + Date.now() };
                 manager.olam.addObject(obj.constructor.name, options);
             }
        },
        
        toolAltAction(item) {
             // Logic for tools
             if (item.className === 'ElementalStaff') {
                 // Toggle mode in customData
                 if(!item.customData) item.customData = {};
                 const modes = ['fire', 'water', 'air', 'earth'];
                 let idx = item.customData.modeIndex || 0;
                 idx = (idx + 1) % modes.length;
                 item.customData.modeIndex = idx;
                 const mode = modes[idx];
                 
                 manager.olam.ayshPeula("ui event", "effectsOverlay", { text: `Staff Mode: ${mode.toUpperCase()}`, color: "#ffffff" });
                 
                 // Persist to inventory
                 if(manager.olam.player) manager.olam.player.inventory.updateUI();
             }
        }
    };
}
