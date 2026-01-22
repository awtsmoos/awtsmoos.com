//B"H
/**
 * ManagerOfAllWorlds - Orchestrating the manifestation of worlds from within the main thread.
 * Refined to ensure canvas control is properly managed between world transitions.
 */
 
import Utils from "../utils.js";
import UIManager from "./uiManager/index.js"
import OlamWorkerManager from "./ikarOyvedManager.js";

class ManagerOfAllWorlds {
	gameState = {};
    started = false;
    ikarUI = null;
    constructor(workerPath) {
        setupGlobalFunctions();
      
        var self = this;
        var uiManager = new UIManager();
        this.uiManager = uiManager;
        var ui = uiManager.UI({
            onstart(ob) {
                self.startWorld(ob);
            }
        });
        this.ui = ui;
    }

    /**
     * B"H
     * registerServiceWorker - Sets up the background guard for assets.
     */
    async registerServiceWorker(workerPath) {
        try {
            var registration = await navigator.serviceWorker.register(workerPath);
            console.log('B"H: Service Worker Registered', registration);
        } catch (e) {
            console.log('B"H: Service Worker Registration Failed', e);
        }
    }

    /**
     * B"H
     * setOnmessage - Listens for whispers from the workers.
     */
    setOnmessage() {
        try {
            if(this.socket) {
                this.socket.onmessage = e=>{
                    if(e.data.switchWorlds) {
                        this.switchWorlds({ ...e.data.switchWorlds });
                    }
                    if(e.data.loadedWorld) {
                        this.uiManager.makeGameMenu();
                    }
                };
            }
        } catch(e) {
            console.error("B\"H: Not able to set up world listeners", e);
        }
    }

    /**
     * B"H
     * destroyWorld - Dissolves the current world to make room for the new.
     * Terminates the worker thread to release its ownership of the OffscreenCanvas sequence.
     */
    async destroyWorld() {
        return new Promise((r,j) => {
            if(!this.socket) { r(true); return; }
            this.socket.onmessage = e=>{
				var dst = e.data.destroyed;
                if(dst) {
                    /**
                     * B"H: We must terminate the physical thread to free the sequence.
                     */
                    if (this.socket.eved) {
                        this.socket.eved.terminate();
                    }
                    delete this.socket;
                    r(true);
                }
            };
            this.socket.postMessage({ destroyWorld: true });
            this.started = false;
        });
    }

    /**
     * B"H
     * switchWorlds - Transitions between realms of existence.
     */
    async switchWorlds({ worldDayuh, gameState }) {
        if(gameState && gameState.shaym) {
            this.gameState[gameState.shaym] = gameState;
        }
        await this.destroyWorld();
        var ld = this.ui.getHtml("loading");
        if(ld) this.ui.setHtml(ld, { className: "loading" });

        this.ui.htmlAction({
            shaym: "action loading",
            properties: { innerHTML: "Getting ready to start loading..." }
        });
        this.startWorld({ worldDayuh });
    }

    /**
     * B"H
     * startWorld - Manifests a new world and its associated worker.
     * Recreates the canvas element to reset the 'Transfer Control' state.
     */
    async startWorld(ob = {}) {
        var { worldDayuh, worldDayuhURL, gameUiHTML, sourcePath } = ob;
        
        if (sourcePath) {
            window.currentWorldSourcePath = sourcePath;
            const newUrl = new URL(window.location);
            const decodedPath = decodeURIComponent(sourcePath);
            const levelMatch = decodedPath.match(/worlds\/([^/]+)\.js$/) || decodedPath.match(/\/([^/]+)\.js$/);
            const alias = window.curAlias || newUrl.searchParams.get('alias');

            if (levelMatch && levelMatch[1] && alias) {
                newUrl.searchParams.delete('path');
                newUrl.searchParams.set('alias', alias);
                newUrl.searchParams.set('level', levelMatch[1]);
            } else {
                newUrl.searchParams.set('path', sourcePath);
            }
            window.history.pushState({ path: sourcePath }, '', newUrl);
        }

        if (gameUiHTML) this.gameUiHTML = gameUiHTML;

        var self = this;
        var ghtml = worldDayuh?.html || {};
        Object.assign(ghtml, self.gameUiHTML);

        let playerSettings = null;
        if (window.curAlias) {
            try {
                const settingsPath = "desktop.folder/game data.folder/playerData.json";
                const response = await fetch(`/api/social/aliases/${window.curAlias}/fileSystem/readFile?path=${encodeURIComponent(settingsPath)}`);
                if (response.ok) {
                    const text = await response.text();
                    try {
                        playerSettings = JSON.parse(text);
                        if (playerSettings && (playerSettings.error || playerSettings.code === "NO_AWTS_RESP")) {
                            playerSettings = null;
                        }
                    } catch(e) {}
                }
            } catch (e) {}
        }

        var systemInfo = {
            html: ghtml,
            gameState: this.gameState,
            set: {
                playerSettings: playerSettings,
                curAlias: window.curAlias || null
            },
            ...(worldDayuhURL ? { worldDayuhURL } : {}),
        };

        var canvas = this.ui.$g("canvasEssence");
        if (!canvas) return false;

        /**
         * B"H - THE GREAT CANVAS RE-MANIFESTATION
         * Because transferControlToOffscreen can only be called once,
         * we must manifest a Fresh Vessel for the new soul (Worker).
         */
        const freshCanvas = document.createElement("canvas");
        freshCanvas.id = canvas.id;
        freshCanvas.className = canvas.className;
        freshCanvas.style.cssText = canvas.style.cssText;
        
        // Swap them in the physical world (DOM)
        canvas.parentNode.replaceChild(freshCanvas, canvas);
        canvas = freshCanvas;
        
        // Update the UI manager's internal map
        this.ui.setHtmlByShaym("canvasEssence", canvas);

        var man = new OlamWorkerManager(
            "./ckidsAwtsmoos/Olam/oyved.js", 
            {
                async pawsawch() {
                    man.postMessage({ heescheel: { userInfo: { ...worldDayuh }, systemInfo } });
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

/**
 * B"H
 * Established the global search functions firmly within the physical world (main thread).
 */
function setupGlobalFunctions() {
    window.searchForProperty = function(event, propertyName, returnIt = false) {
        if (!event || !event.target) return null;
        let el = event.target;
        while (el && el !== document.body && el !== document.documentElement) {
            if (el[propertyName] !== undefined) {
                return returnIt ? el : el[propertyName];
            }
            el = el.parentElement;
        }
        return null;
    };
}

export default ManagerOfAllWorlds;