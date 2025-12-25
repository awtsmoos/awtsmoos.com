//B"H
/**
 * ManagerOfAllWorlds - Orchestrating the manifestation of worlds from within the main thread.
 * purifed to ensure the Global Bridge is stable for all incoming Worker events.
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

    async registerServiceWorker(workerPath) {
        try {
            var registration = await navigator.serviceWorker.register(workerPath);
            console.log('B"H: Service Worker Registered', registration);
        } catch (e) {
            console.log('B"H: Service Worker Registration Failed', e);
        }
    }

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

    async destroyWorld() {
        return new Promise((r,j) => {
            if(!this.socket) { r(false); return; }
            this.socket.onmessage = e=>{
				var dst = e.data.destroyed;
                if(dst) {
                    delete this.socket;
                    r(true);
                }
            };
            this.socket.postMessage({ destroyWorld: true });
            this.started = false;
        });
    }

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