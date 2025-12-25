
/**
 * B"H
 * World Logic Handlers (Main Thread Side)
 */
import LocalDatabase from "../../../utils/LocalDatabase.js";

export default function worldHandlers(manager) {
    const { eved, myUi } = manager;

    return {
        destroyWorld() {
             if(manager.olam) {
                 manager.olam.ayshPeula("destroy");
                 if(eved) eved.postMessage({ destroyed: true });
             }
        },

        async downloadWorld(ob) {
            // ob contains: { text (content), name, description, overwrite }
            
            try {
                // The Worker has already stringified the world state into ob.text
                // We just need to save it.
                
                var str = ob.text;
                var fileName = (ob.name || "world_" + Date.now()).replace(/[^a-z0-9]/gi, '_').toLowerCase();
                if (!fileName.endsWith('.js')) fileName += '.js';

                // 1. Try Cloud Save if User is Logged In
                if(window.curAlias) {
                    try {
                        const fullPath = "desktop.folder/game data.folder/worlds/" + fileName;
                        const response = await fetch(`/api/social/aliases/${window.curAlias}/fileSystem/makeFile`,  {
                            method: "POST",
                            body: new URLSearchParams({
                                path: fullPath,
                                value: str
                            })
                        });
                        
                        const d = await response.json();
                        if(d && d.success) {
                            myUi.peula("ikar", {
                                olamPeula: {
                                    htmlPeula: {
                                        effectsOverlay: { text: "World Saved to Cloud!", color: "#00ff00" }
                                    }
                                }
                            });
                            return; // Success
                        }
                    } catch(e) {
                        console.warn("B\"H: Cloud save failed, falling back to Local.", e);
                    }
                }

                // 2. Fallback: Save to Local IndexedDB
                try {
                    await LocalDatabase.saveWorld({
                        name: ob.name || "Untitled World",
                        description: ob.description || "Saved offline."
                    }, str);

                    myUi.peula("ikar", {
                        olamPeula: {
                            htmlPeula: {
                                effectsOverlay: { text: "World Saved Locally!", color: "#4cc9f0" }
                            }
                        }
                    });
                } catch(e) {
                    console.error("B\"H: Local save failed.", e);
                    
                    // 3. Last Resort: Download File
                    var a = document.createElement("a");
                    var blob = new Blob([str], { type: "application/javascript" });
                    a.href = URL.createObjectURL(blob);   
                    a.download = fileName;
                    a.click();
                    URL.revokeObjectURL(a.href);
                    
                    myUi.peula("ikar", {
                        olamPeula: {
                            htmlPeula: {
                                effectsOverlay: { text: "World Downloaded (File)", color: "orange" }
                            }
                        }
                    });
                }

            } catch(e) {
                console.log("Issue saving world: ",e);
                myUi.peula("ikar", {
                    olamPeula: {
                        htmlPeula: {
                            effectsOverlay: { text: "Save Failed!", color: "red" }
                        }
                    }
                });
            }
        },

        activeObjectAction(a) {
            // Proxy action
        },

        "game started"(a) {},

        loadedWorld() {
             if(manager.onLoadedWorld) manager.onLoadedWorld();
        },

        switchWorlds(stringifiedWorldDayuh) {}
    };
}
