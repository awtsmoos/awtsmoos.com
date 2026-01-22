
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
                // B"H: Broadcast only. Do NOT trigger save() here, as save() fires updateProgress.
                postMessage({ updateProgress: data });
            });

            me.olam.on("increased percentage", (data) => {
                postMessage({ increasedOlamLoading: data });
            });

            me.olam.on("get window size", async () => {
                const id = "ws_" + Date.now() + "_" + Math.random();
                postMessage({ getWindowSize: id });
                return await me.registerPromise(id);
            });

            me.olam.on("updateQuestLog", () => {
                postMessage({ sendUiEvent: { shaym: "questLog", ob: { refresh: true } } });
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

        async getQuests({ sortBy }) {
            if (!me.olam || !me.olam.shlichusHandler) return { quests: [] };
            const list = me.olam.shlichusHandler.getSortedQuests(sortBy);
            return { 
                tawchlees: { 
                    quests: list.map(q => ({ 
                        id: q.id, title: q.title, description: q.description, 
                        priority: q.priority, expiresAt: q.expiresAt, state: q.state 
                    })) 
                } 
            };
        },

        async markQuestComplete(questId) {
             if (me.olam && me.olam.shlichusHandler) {
                 const q = me.olam.shlichusHandler.activeQuests.get(questId);
                 if (q) q.markAsComplete();
             }
        },

        async dropQuest(questId) {
             if (me.olam && me.olam.shlichusHandler) {
                 const q = me.olam.shlichusHandler.activeQuests.get(questId);
                 if (q) {
                     me.olam.shlichusHandler.activeQuests.delete(questId);
                     me.olam.shlichusHandler.notifyUpdate();
                     me.olam.ayshPeula("ui event", "effectsOverlay", { text: "Mission Abandoned", color: "orange" });
                 }
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
        }
    };
}
