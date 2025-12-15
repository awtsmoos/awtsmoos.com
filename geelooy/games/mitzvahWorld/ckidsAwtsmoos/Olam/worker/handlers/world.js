
/**
 * B"H
 * World Logic Handlers
 */
export default function worldHandlers(manager) {
    const { eved, myUi } = manager;

    return {
        downloadWorld(ob) {
            // ob contains: { name, description, overwrite }
            
            try {
                // Get the latest world state string
                var olamStringed = manager.olam?.getCompiledNivrayimInfo?.();
                
                // Add Metadata Header
                var date = new Date().toLocaleString();
                var metaHeader = `// B"H\n// World: ${ob.name || "Untitled"}\n// Description: ${ob.description || "No description."}\n// Saved: ${date}\n\n`;
                
                var str = `${metaHeader}export default ${JSON.stringify(olamStringed, null, "\t")}\n\n//Blessings and Success`;
                
                if(window?.curAlias) {
                    // Logged in: Save to File System
                    let fileName = (ob.name || "world_" + Date.now()).replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    if (!fileName.endsWith('.js')) fileName += '.js';
                    
                    // If overwrite is false, ensure unique name (simple timestamp append)
                    if (ob.overwrite === false) {
                        fileName = fileName.replace('.js', '') + "_" + Date.now() + ".js";
                    }

                    const fullPath = "desktop.folder/game data.folder/worlds/" + fileName;

                    fetch(`/api/social/aliases/${window?.curAlias}/fileSystem/makeFile`,  {
                        method: "POST",
                        body: new URLSearchParams({
                            path: fullPath,
                            value: str
                        })
                    }).then(async r => {
                        var d = await r.json();
                        if(d?.success) {
                            myUi.peula("ikar", {
                                olamPeula: {
                                    htmlPeula: {
                                        effectsOverlay: { text: "World Saved!", color: "#00ff00" }
                                    }
                                }
                            });
                        } else {
                            myUi.peula("ikar", {
                                olamPeula: {
                                    htmlPeula: {
                                        effectsOverlay: { text: "Save Failed!", color: "red" }
                                    }
                                }
                            });
                        }
                    });
                } else {
                    // Not Logged in: Download as file
                    var a = document.createElement("a");
                    var blob = new Blob([str], { type: "application/javascript" });
                    a.href = URL.createObjectURL(blob);   
                    a.download = (ob.name || "BH_World") + ".js";
                    a.click();
                    URL.revokeObjectURL(a.href);
                }
            } catch(e) {
                console.log("Issue saving world: ",e);
            }
        },

        activeObjectAction(a) {
            // Proxy action, can be logged or extended
        },

        "game started"(a) {},

        loadedWorld() {
             if(manager.onLoadedWorld) manager.onLoadedWorld();
        },

        switchWorlds(stringifiedWorldDayuh) {}
    };
}
