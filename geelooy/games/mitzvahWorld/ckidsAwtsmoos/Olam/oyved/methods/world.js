// B"H
/**
 * world.js - Orchestrating the laws of the digital universe from within the Worker.
 */
import Utils from "../../../utils.js";
import ProceduralGenerators from "../../math/ProceduralGenerators.js";

export default function(me, OlamClass) {
    return {
        async heescheel(options = {}) {
            if (!OlamClass) return { tawchlees: { message: "Class not loaded", code: "ERROR" } };
            me.olam = new OlamClass();
            
            me.olam.on("updateProgress", (data) => {
                postMessage({ updateProgress: data });
                if (me.olam.userProgressManager) me.olam.userProgressManager.save();
                // B"H REMOVED: me.olam.ohr() call here was causing an infinite light loop!
            });

            // B"H: The Missing Link! Bridge loading updates to the UI.
            me.olam.on("increased percentage", (data) => {
                postMessage({ increasedOlamLoading: data });
            });

            // B"H: Bridge for Window Size requests from Olam (resizing.js)
            me.olam.on("get window size", async () => {
                const id = "ws_" + Date.now() + "_" + Math.random();
                postMessage({ getWindowSize: id });
                // Return the promise so ayshPeula waits for the response from Main Thread
                return await me.registerPromise(id);
            });

            me.olam.on("updateQuestLog", () => {
                if (me.olam.shlichusHandler) {
                    const active = Array.from(me.olam.shlichusHandler.activeQuests.values()).map(q => ({
                        id: q.id, shaym: q.title, objective: q.description,
                        progress: q.collected / (q.totalCollectedObjects || 1) * 100,
                        state: q.state, priority: q.priority
                    }));
                    postMessage({ sendUiEvent: { shaym: "questLog", ob: { updateQuests: { active } } } });
                }
            });

            me.olam.on("hide loading screen", () => postMessage({ hideLoadingScreen: true }));
            me.olam.on("ready to start game", () => {
                postMessage({ "game started": true });
                postMessage({ loadedWorld: true });
            });

            try {
                await me.olam.init();
                await me.olam.tzimtzum(options);
                return { tawchlees: { code: "OLAM_GOOD" } };
            } catch(e) {
                return { tawchlees: { code: "ERROR", error: e.stack } };
            }
        },

        async executeCommand(cmdStr) {
            if (!me.olam || !me.olam.player || !cmdStr.startsWith("/")) return;
            const parts = cmdStr.slice(1).split(" ");
            const cmd = parts[0].toLowerCase();
            const args = parts.slice(1);
            const player = me.olam.player;

            switch(cmd) {
                case "spawn": {
                    const word = args[0] || "אור";
                    const gematria = ProceduralGenerators.calculateGematria(word);
                    const scale = Math.max(0.5, Math.min(5, gematria / 10));
                    const count = args[1] ? parseInt(args[1]) : 1;
                    
                    const golem = { 
                        guf: { "BoxGeometry": [scale, scale, scale] },
                        toyr: { "MeshLambertMaterial": { color: `hsl(${gematria % 360}, 100%, 50%)` } }
                    };

                    if (count > 1) {
                        golem.modifiers = [{ type: 'array', count, offset: { x: scale + 0.1, y: 0, z: 0 } }];
                    }

                    player.inventory.addItem({ 
                        className: "Brick", id: "spawn_" + Date.now(),
                        name: "Creation: " + word, golem 
                    }, 1);
                    break;
                }

                case "atzmus": {
                    me.olam.scene.traverse(child => {
                        if (child.isMesh && child.material) {
                            const mats = Array.isArray(child.material) ? child.material : [child.material];
                            mats.forEach(m => m.wireframe = !m.wireframe);
                        }
                    });
                    break;
                }
            }
        },

        async downloadWorld(a) {
            try {
                var olamStringed = me?.olam?.getCompiledNivrayimInfo?.();
                postMessage({ downloadWorld: { text: JSON.stringify(olamStringed, null, "\t"), ...a } });
            } catch(e){ console.log("Issue saving world: ",e); }
        },
        
        async updateLiveEntity(info) {
             const { id, data } = info;
             if (!me.olam || !me.olam.nivrayim) return;
             
             // Find entity by Name or ID (some use name as ID)
             const entity = me.olam.nivrayim.find(n => n.name === id || n.id === id);
             
             if (entity) {
                 if (entity.updateProperties) {
                     entity.updateProperties(data);
                 } else {
                     // Fallback for generic entities
                     if (data.name) entity.name = data.name;
                     if (data.customData) entity.customData = { ...entity.customData, ...data.customData };
                 }
             }
        }
    };
}
