/**
 * B"H
 * Worker
 * 
 * manages game state to send to main thread.
 */
//B"H

import Utils from "../utils.js";

import * as THREE from '/games/scripts/build/three.module.js';
import("./index.js").then(async r => {
  
    self.Olam = r.default;
    try {
        await go();
    } catch(e) {
        console.log("Issue",e)
    }
}).catch(e=> {
    console.log("NO",e)
})

//import Olam from "./index.js"
console.log("Loaded")
async function go() {
    //console.log("Hi!")
    var inter;

    // Map to keep track of resolve functions for each action
    var promiseMap = new Map();


    var off/*official*/ = "official"


    // A function to register a promise and return a unique identifier
    function registerPromise(id) {
        
        return new Promise((resolve, reject) => {
            promiseMap.set(id, { resolve, reject });
        });
    }

    /*local variables to use for game state*/
    var me = {
        olam: null
    }

    var tawfkeedeem/*tasks to do*/ = {
	async moveToActionBar({ fromInventoryIndex, toActionIndex }) {
            if (me.olam && me.olam.player && me.olam.player.inventory) {
                me.olam.player.inventory.moveToActionBar(fromInventoryIndex, toActionIndex);
            }
        },
        async moveFromActionBar({ actionIndex }) {
            if (me.olam && me.olam.player && me.olam.player.inventory) {
                me.olam.player.inventory.moveFromActionBar(actionIndex);
            }
        },
	    async saveSettings(data) {
                // Only works if user is logged in (has an alias)
                if(!window.curAlias) return;

                try {
                    // Format as a JS module so it can be imported easily later
                    const fileContent = `//B"H\n//Awtsmoos User Settings & Inventory\nexport default ${JSON.stringify(data, null, 4)}`;
                    
                    // Path: desktop.folder/game data.folder/awtsmoosSettings.js
                    const path = "desktop.folder/game data.folder/awtsmoosSettings.js";

                    await fetch(`/api/social/aliases/${window.curAlias}/fileSystem/makeFile`, {
                        method: "POST",
                        body: new URLSearchParams({
                            path: path,
                            value: fileContent
                        })
                    });
                    
                   // console.log("Settings saved to " + path);
                } catch(e) {
                    console.error("Failed to auto-save settings:", e);
                }
            },
	    async equipItem(payload) {
	        if (me.olam && me.olam.player && me.olam.player.inventory) {
	            console.log("Worker is now equipping with full payload:", payload);
	            // B"H FIX: We now pass the entire payload object, not just parts of it.
	            me.olam.player.inventory.equipItem(payload);
	        }
	    },
	
	    async unequipItem(slotName) {
	        if (me.olam && me.olam.player && me.olam.player.inventory) {
	            console.log("Unequipping slot", slotName);
	            // Call the method we added to InventoryManager in the previous step
	            me.olam.player.inventory.unequipItem(slotName);
	        }
	    },
        
        async addItem(itemData) {
            if (me.olam && me.olam.player && me.olam.player.inventory) {
                console.log("Adding item to inventory via worker:", itemData);
                me.olam.player.inventory.addItem(itemData, itemData.quantity || 1);
            }
        },
    
    
    
    
     async selectInventorySlot({ index }) {
        if (me.olam && me.olam.player) {
            me.olam.player.selectedInventorySlot = index;
            console.log("Selected inventory slot:", index);
            // You can add UI feedback here later, like highlighting the selected slot
        }
    },
    async requestInventoryUpdate() {
        if (me.olam && me.olam.player && me.olam.player.inventory) {
            // Now we can safely call updateUI because we know the UI is ready and waiting.
            me.olam.player.inventory.updateUI();
        }
    },
        async activeObjectAction(a) {
            await me.olam.ayshPeula("activeObjectAction", a)
        },
        async downloadWorld(a) {
            
            try {
                var olamStringed = me?.olam?.getCompiledNivrayimInfo?.();
                var str = `//B"H
//Downloaded the world at ${
    new Date()
}!

export default ${
    JSON.stringify(olamStringed, null, "\t")
}

//Blessings and Success`
                console.log(olamStringed,str);
                postMessage({
                    downloadWorld: {
                        text: str
                    }
                })
            } catch(e){
                console.log("Issue saving world: ",e)
            }
        },
        async takeInCanvas({
            canvas,
            devicePixelRatio
        }) {
            me.olam.takeInCanvas(canvas, devicePixelRatio);
            
            await me.olam.heesHawvoos();

        },
        
        mouseup(e){
            if(me.olam) {
                me.olam.ayshPeula("mouseup", e);
            }
        },
        rightmousedown() {
            if(me.olam) {
                me.olam.ayshPeula("rightmousedown", e);
            }
        },
        rightmouseup() {
            if(me.olam) {
                me.olam.ayshPeula("rightmouseup", e);
            }
        },
        mousedown(e){
            if(me.olam) {
                me.olam.ayshPeula("mousedown", e);
            }
        },
        presskey(e) {
            console.log("peula",e);
            if(me.olam) {
                me.olam.ayshPeula("presskey", e)
            }
        },
        keyup(e){
            if(me.olam) {
                me.olam.ayshPeula("keyup", e);
            }
        },
        keydown(e){
            if(me.olam) {
                me.olam.ayshPeula("keydown", e);
            }
        },
        wheel(e){
            if(me.olam) {
                me.olam.ayshPeula("wheel", e);
            }
        },
        mousemove(e){
            //console.log("Moved mouse",e)
            if(me.olam) {
                me.olam.ayshPeula("mousemove", e);
            }
        },
        resize(e) {
            if(me.olam) {
                me.olam.ayshPeula("resize", e);
            }
        },
        async destroyWorld(e) {
            console.log("DEstroying",e)
            if(me.olam) {
                await me.olam.ayshPeula("destroy");
                //delete me.olam;
            }
            postMessage({
                deleteCanvas: true
            })
        },
        hi(){
            
            return "Hi"
        },

        async awtsmoosEval(code) {
            if(typeof(code) == "string") {
                var result = eval(code);
                return msg(
                    "Got result of code",
                    "SUCCESS",
                    {code:result + ""}
                );
            }
            
        },
        
        async htmlPeula(obj={}) {
            for(var k in obj) {
                me.olam.ayshPeula("htmlPeula", {
                    [k]: obj[k]
                });
            }
        },

        async htmlSet(shaym) {
            if(!me.olam)
            return;

            me.olam.ayshPeula("htmlSet", shaym);
        },
        
        async htmlCreated(info) {
            if(!me.olam)
            return;

            me.olam.ayshPeula("htmlCreated", info);
            // Check if there is a promise to resolve
            var promiseInfo = promiseMap.get(info.id);
            
            if (promiseInfo) {
                
                if(info.id) delete info.id
                info[off] = true;
                promiseInfo.resolve(info);
                promiseMap.delete(info.id);
            }
        },
        
        htmlDeleted(info) {
            if(!me.olam)
            return;

            me.olam.ayshPeula("htmlDeleted", info);
            // Check if there is a promise to resolve
            var promiseInfo = promiseMap.get(info.id);
            
            if (promiseInfo) {
                info[off] = true;
                if(info.id) delete info.id
                promiseInfo.resolve(info);
                promiseMap.delete(info.id);
            }
        },
        htmlGot(info) {
            if(!me.olam)
            return;

            me.olam.ayshPeula("htmlGot", info);
            // Check if there is a promise to resolve
            var promiseInfo = promiseMap.get(info.id);
            
            if (promiseInfo) {
                
                info[off] = true;
                if(info.id) delete info.id
                promiseInfo.resolve(info);
                promiseMap.delete(info.id);
            }
        },

        uiEvented(info) {
            if(!me.olam) return;
            var id = info?.id
            if(!id) return;
            var pi = promiseMap.get(id);
            if(pi) {
                if(info.id) delete info.id;
                pi?.resolve(info);
                promiseMap?.delete?.(id)
            }
        },
        htmlActioned(info) {
            if(!me.olam)
            return;

            me.olam.ayshPeula("htmlActioned", info);
            // Check if there is a promise to resolve
            var promiseInfo = promiseMap.get(info.id);
            
            if (promiseInfo) {
                
                info[off] = true;
                if(info.id) delete info.id
                promiseInfo.resolve(info);
                promiseMap.delete(info.id);
            }
        },
        sized({id, size}) {
            var promiseInfo = promiseMap.get(id);
            
            if (promiseInfo) {
                
       
               
                promiseInfo.resolve(size);
                promiseMap.delete(id);
            }
        },
        gotMapCanvas(info) {
   
         //   me.olam.ayshPeula("start minimap", info)
        },
        scrolledMap(info) {
            // Check if there is a promise to resolve
            var promiseInfo = promiseMap.get(info.id);
            
            if (promiseInfo) {
                
                info[off] = true;
                if(info.id) delete info.id
                promiseInfo.resolve(info);
                promiseMap.delete(info.id);
            }
        },
        async captureMinimapScene(info) {
            if(!me.olam) return;
            return await me.olam.ayshPeula("captureMinimapScene", info)
        },
        async heescheel/*start world*/ (options ={}) {
            
            me.olam = new Olam();
            await me.olam.init()

            me.olam.on("update minimap scroll", async ({
                center,
                minimapCamera
            }) => {
            //    console.log("Scrolling!",center)
                var id = Math.random().toString();
                var resultPromise = registerPromise(id);
                
                
                
                // Now you can handle the result right here
                
                try {
                    postMessage({
                        updateMinimapScroll: {
                            center,
                            minimapCamera,
                            id
                        }
                    })
                } catch(e) {
                    console.log(e)
                    return null;
                }
                var result = await resultPromise;
                return result;
            });

            me.olam.on("hide loading screen", () => {
                postMessage({
                    hideLoadingScreen: true
                })
                
            })
            me.olam.on("increased percentage", (info = {}) => {
                try {
                    postMessage({
                        increasedOlamLoading: info
                    })
                } catch(e) {
                    console.log(e,4)
                }
            });

            me.olam.on("error", er => {
                postMessage({
                    error: er
                })
            })

            me.olam.on("reset loading percentage", () => {
                postMessage({
                    resetPercentage: true
                })
            })

            me.olam.on("htmlCreate", async (info={}) => {
                var dayuh = Utils.stringifyFunctions(info);
                dayuh.id = Math.random().toString();
                var resultPromise = registerPromise(dayuh.id);
                postMessage({
                    htmlCreate: dayuh
                });
                var result = await resultPromise;
                // Now you can handle the result right here
                return result;
            });

            me.olam.on("switchWorlds", async (worldDayuh) => {
                
                var dayuh = Utils.stringifyFunctions(worldDayuh);
                postMessage({
                    switchWorlds: dayuh
                })
            });
            
            me.olam.on("htmlDelete", async (info={}) => {
                postMessage({
                    htmlDelete: info
                })
            })
            
            me.olam.on("setup map", async () => {
                postMessage({
                    startMapSetup: true
                })
            });
            me.olam.on("alert", async (...ms) => {
           //     console.log("ALERTING: ",ms)
            /* postMessage({
                    alert: ms
                })*/
            })

            me.olam.on("updateProgress", (data) => {
                postMessage({
                    updateProgress: data
                })
            })
            me.olam.on("send ui event", async (shaym, ob) => {
                var id = Math.random().toString();
                var resultPromise = registerPromise(id);
                
                postMessage({
                    sendUiEvent: {
                        shaym,
                        ob,
                        id
                    }
                });
                var result = await resultPromise;
                // Now you can handle the result right here
                return result;
            })
            me.olam.on("setHtml", async ({shaym,info={}}={}) => {
                var dayuh = Utils.stringifyFunctions(info);
                info.id = Math.random().toString();
                var resultPromise = registerPromise(info.id);
                
                postMessage({
                    setHtml: {
                        shaym,
                        dayuh
                    }
                });
                var result = await resultPromise;
                // Now you can handle the result right here
                return result;
            });


            me.olam.on("htmlAction", async (info={}) => {
                
                info.id = Math.random().toString();
                var dayuh = Utils.stringifyFunctions(info);
                var resultPromise = registerPromise(info.id);
                postMessage({
                    htmlAction: dayuh
                });
                var result = await resultPromise;
                // Now you can handle the result right here
                return result;
            });

            me.olam.on("get window size", async () => {
                var id = Math.random().toString();
                var resultPromise = registerPromise(id);
                postMessage({
                    getWindowSize: id
                });

                var result = await resultPromise;
                // Now you can handle the result right here
                return result;
            })
            me.olam.on("htmlActions", async (info={}) => {
                
                var id = Math.random().toString();
                var dayuh = Utils.stringifyFunctions(info);
                var resultPromise = registerPromise(id);
                var ob = {
                    htmlActions: {
                        ar: dayuh,
                        id
                    }
                }
                postMessage(ob);
                var result = await resultPromise;
                // Now you can handle the result right here
                return result;
            });

            me.olam.on("htmlAppend", async (info={}) => {
                
                var dayuh = Utils.stringifyFunctions(info);
                info.id = Math.random().toString();
                var resultPromise = registerPromise(info.id);
                var ob = {
                    htmlAppend: dayuh
                }
                postMessage(ob);
                var result = await resultPromise;
                // Now you can handle the result right here
                return result;
            });

            me.olam.on("ready to start game", () => {
                postMessage({
                    "game started": true
                })
                console.log("LOAD")
                postMessage({
                    loadedWorld: true
                })
                
            });

            me.olam.on("htmlGet", async (info={}) => {
                
                info.id = Math.random().toString();
                var resultPromise = registerPromise(info.id);
                postMessage({
                    htmlGet: info
                })
                
                var result = await resultPromise;
                // Now you can handle the result right here
                return result;
            })
            
            var result;
            try {
                
                result = await me.olam.tzimtzum(options);

            } catch(e) {
                console.log("Awtsmoos erro:" ,e)
                return msg(
                    "There was an error.",
                    "ERROR",
                    {error:e.stack}
                )
            }
            if(result) {
                me.olam.on("mouseLock", () => {
                    postMessage({
                        lockMouse: true
                    });
                });
                me.olam.on("mouseRelease", () => {
                    postMessage({
                        lockMouse: false
                    });
                });

                

                return msg(
                    "Successfully made me.olam",
                    "OLAM_GOOD"
                );
            }
        },

        async getBitmap(toRender=false) {
            if(me.olam && me.olam.renderer && me.olam.renderer.domElement) {
                var can = me.olam.renderer.domElement;
                if(toRender) {
                    me.olam.heesHawvoos();
                }
                var bit = null;
                bit = can.transferToImageBitmap();
                return {
                    tawchlees: bit,
                    transfer: true
                }
            }
        },
        async getCanvas() {
            if(me.olam && me.olam.renderer && me.olam.renderer.domElement) {
                var can = me.olam.renderer.domElement;
                
                return me.olam.renderer.domElement;
            }
        },
        async getOlam() {
            if(me.olam !== null && me.olam.serialize) {
                return {tawchlees:me.olam.serialize()};
            }
        }
    };

    function msg(message, code, extra={}) /*generates message 
    object to send back*/{
        
        return {tawchlees:{
            message,
            code,
            ...extra
        }}
    }



    addEventListener("message", async e=> {
        var dayuh/*data*/ = e.data;
        if(typeof(dayuh) == "object") {
            
            try {
                for(var q of Object.keys(dayuh)) {
                    var tawfeek /*function to do*/
                        = tawfkeedeem[q];
                    if(typeof(tawfeek) == "function") {
                        var result = await tawfeek(dayuh[q]);
                        
                        var tawch;
                        if(!result) result = {};
                        if( result.tawchlees) {
                            tawch = result.tawchlees
                        };
                        
                        var shouldITransfer = !!result.transfer;
                        postMessage({
                            [q]: tawch
                        }, shouldITransfer?[tawch]: undefined)
                    }
                }
            } catch(e) {
                console.log(e)
            }
        }
    })

    console.log("opened worker")
    postMessage({
        pawsawch/*opened*/:true
    })
}

var ol = console.log;
//console.log = (...a) => {
  //  ol("LOL",a)
//}
