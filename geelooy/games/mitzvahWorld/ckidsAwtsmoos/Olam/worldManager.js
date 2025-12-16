

/**
 * B"H
 */

/**
 * start communication with worker
 * manger.
 * 
 * First argument: the path 
 * to the worker itself.
 * 
 * Second, an object with 
 * "async pawsawch (open)" --" what to do when opened.
 * 
 * Then when it opens, it sends a message to the 
 * worker MANAGER (using postMessage),
 * which then, behind the scenes, sends 
 * a message to the worker itself.
 * 
 * In that postMessage, it has an object of the information.
 * 
 * Then, we pass in the canvas
 * 
 * @requires the e object
 * to have detail: {
 *  worldDayuh: {
 *      world info
 *  },
 * gameUiHTML: {
 *      JS objects
 *  representing in game HTML
 *  }
 * }
 * 
 * and the @argument opts an
 * object containing an @optional error
 * event and a @optional canvas object
 * (canvas element) if not provided
 * will be generated automatically.
 */
 
import 
    Utils
from "../utils.js";


import UIManager from "./uiManager/index.js"




import OlamWorkerManager from "./ikarOyvedManager.js";

class ManagerOfAllWorlds {

	gameState = {};
    started = false;
    ikarUI = null;
    constructor(workerPath) {
        setupGlobalFunctions()
      
        var self = this;
        var uiManager = new UIManager();
        this.uiManager = uiManager;
        var ui = uiManager.UI({
            onstart(ob) {
                console.log("STARTED")
                self.startWorld(ob);
            }
        });
        this.ui = ui;
        
        var h = ui.$g("ikar");
        if(!h) {
            console.log("Main menu not found")
        }

	try {
	       
	       
        }catch(e) {}
    }

    
    async registerServiceWorker(workerPath) {
        
        try {
            var registration = await navigator
            .serviceWorker.register(workerPath);
            console.log('Service Worker Registered', registration);
        } catch (e) {
            console.log('Service Worker Registration Failed', e);
        }
    }

    
    setOnmessage() {
        
        try {
           // alert("Setting socket message "+ this.socket)
            if(this.socket) {
                
                
                
                this.socket.onmessage = e=>{
                    
                    if(e.data.switchWorlds) {
                        this.switchWorlds({
                            ...e.data.switchWorlds
                        })
                    }

                    if(e.data.loadedWorld) {
                        console.log("LOADED")
                        this.uiManager.makeGameMenu();
                    }

                    
                };
                
                this.socket.onerror = this.onerror
            } else {
                console.log("no socket!")
            }
        } catch(e) {
            alert(" Not able to set up world")
            console.log("Not set",e)
        }
    }

    async destroyWorld() {
        return new Promise((r,j) => {
            if(!this.socket) r(false);
            this.socket.onmessage = e=>{
				/**
					should have some info 
					about characters etc.
				**/
				var dst = e.data.destroyed;
                if(dst) {
                    delete this.socket;
                    
                    r("Destroyed now creating new")
                }


            };
            this.socket.postMessage({
                destroyWorld: true
            });
            this.started = false;
        })
        
    }

    async switchWorlds({
        worldDayuh,
        gameState
    }) {
        if(gameState) {
            if(gameState.shaym) {
                this.gameState[
                    gameState.shaym
                ] = gameState;
            }
        }
        var d = await this.destroyWorld();
        var ld = this.ui.getHtml("loading")
        if(ld)
        var load = this.ui.setHtml(ld, {
            className: "loading"
        })
        console.log("this ui",this.ui)
        this.ui.htmlAction({
            shaym: "action loading",
            properties: {
                innerHTML: "Getting ready to start loading..."
            }
        });
        this.startWorld({worldDayuh});
    }

    async startWorld(ob = {}) {
        var {
            worldDayuh,
            worldDayuhURL,
            gameUiHTML,
            sourcePath // B"H: New property for source file path
        } = ob;
        
        // B"H: Update URL Logic to use 'level' param if possible
        if (sourcePath) {
            window.currentWorldSourcePath = sourcePath;
            const newUrl = new URL(window.location);
            
            // Attempt to extract level name from standard path
            // e.g. .../worlds/myLevel.js -> myLevel
            const decodedPath = decodeURIComponent(sourcePath);
            // Matches any path ending in /worlds/[filename].js or just [filename].js
            // This regex looks for the last segment ending in .js
            const levelMatch = decodedPath.match(/worlds\/([^/]+)\.js$/) || decodedPath.match(/\/([^/]+)\.js$/);
            
            // Check for alias in window global or existing URL
            const alias = window.curAlias || newUrl.searchParams.get('alias');

            if (levelMatch && levelMatch[1] && alias) {
                // We have both an alias and a clean level name
                const levelName = levelMatch[1];
                newUrl.searchParams.delete('path'); // Remove dirty path
                newUrl.searchParams.set('alias', alias);
                newUrl.searchParams.set('level', levelName);
            } else {
                // Fallback to raw path if we can't clean it up
                newUrl.searchParams.set('path', sourcePath);
            }
            
            window.history.pushState({ path: sourcePath }, '', newUrl);
        } else {
            window.currentWorldSourcePath = null;
        }

        if (gameUiHTML) {
            this.gameUiHTML = gameUiHTML
        }

        var self = this;
        var ghtml = worldDayuh?.html || {};
        Object.assign(ghtml, self.gameUiHTML);

        var windowVars = {};
        
        // --- NEW: LOAD PLAYER SETTINGS (JSON) ---
        let playerSettings = null;
        
        // Only attempt load if user is logged in (has alias)
        if (window.curAlias) {
            try {
                console.log("B\"H - Attempting to load player inventory...");
                const settingsPath = "desktop.folder/game data.folder/playerData.json";
                
                // 1. Fetch the file text
                const response = await fetch(`/api/social/aliases/${window.curAlias}/fileSystem/readFile?path=${encodeURIComponent(settingsPath)}`);
                
                if (response.ok) {
                    const text = await response.text();
                    try {
                        playerSettings = JSON.parse(text);
                        // B"H: Check for error object returned by API
                        if (playerSettings && (playerSettings.error || playerSettings.code === "NO_AWTS_RESP")) {
                            console.log("B\"H - Player settings file not found or invalid (new user).");
                            playerSettings = null;
                        } else {
                            console.log("B\"H - Player settings loaded successfully.");
                        }
                    } catch(parseError) {
                         console.warn("B\"H - Error parsing settings JSON", parseError);
                    }
                } else {
                    console.log("B\"H - No settings file found. Starting with empty/default inventory.");
                }
            } catch (e) {
                console.warn("B\"H - Could not load player settings (Network error):", e);
            }
        }
        // ---------------------------------

        var systemInfo = {
            html: ghtml,
            gameState: this.gameState,
            windowVars,
            
            // B"H: Pass user state to the Worker
            set: {
                playerSettings: playerSettings,
                curAlias: window.curAlias || null // Pass alias directly for saving
            },
            
            ...(worldDayuhURL ? {
                worldDayuhURL
            } : {}),
        };

        var userInfo = {
            ...worldDayuh,
        };

        var heescheelObj = {
            userInfo,
            systemInfo
        };

        var canvas = this.ui.$g("canvasEssence");

        if (!canvas) {
            alert("Couldn't find canvas, not starting");
            return;
        }

        var man = new OlamWorkerManager(
            "./ckidsAwtsmoos/Olam/oyved.js", 
            {
                async pawsawch() {
                    var ID = Date.now();
                    man.postMessage({
                        heescheel: heescheelObj
                    });
                }
            },
            canvas,
            this.ui
        );
        window.g = man;

        window.socket = man;
        this.socket = man;
        this.setOnmessage();
     
     
        return true; 
    }
}

function setupGlobalFunctions() {
    /**
     * Searches up the DOM tree from the initial event target to find any parent element that contains the specified variable.
     * @param {Event} event - The event triggered by user interaction.
     * @returns {boolean} - True if a parent element with 'shlichusID' is found; otherwise, false.
     */
    function searchForProperty(event, propertyName, returnIt = false) {
        let el = event.target;
        var pr = null;
        var element = null;
        // Climb up the DOM tree
        while (!pr && el && el !== document.body && el !== document.documentElement) {
            if(pr) break;
            // Check if the element has the 'shlichusID' attribute or property
            // This could be adjusted based on how 'shlichusID' is stored (e.g., data attribute, direct property)
            var prop = el[propertyName]
            if(prop !== undefined) {
                pr = prop;
                element = el;
                break;
            }
            el = el.parentElement; // Move up to the next parent element
        }

        if(returnIt) {
            return element
        }
        return pr; // 'shlichusID' not found in any parent elements
    }
    window.searchForProperty = searchForProperty;
}


export default ManagerOfAllWorlds;
