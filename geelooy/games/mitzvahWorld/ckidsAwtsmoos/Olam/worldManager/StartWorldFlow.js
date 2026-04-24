
/**
 * B"H
 * @module StartWorldFlow
 * @description
 * The flow of drawing the Infinite Light down into the vessels. 
 * Establishing the player's settings, finding their history (UserProgress), 
 * and telling the Angel (Worker) to begin spinning the fabric of space-time.
 */
import OlamWorkerManager from "../ikarOyvedManager.js";

export default {
    /**
     * @async
     * @function startWorld
     * @param {Object} ob - The foundational sparks, containing URLs, Objects, and UI elements.
     * @returns {Promise<boolean>} True if the world has commenced.
     */
    async startWorld(ob = {}) {
        console.log("B\"H - ⚡ INTENSE LOG: Main Thread startWorld initiated. Payload:", ob);
        
        var {
            worldDayuh,
            worldDayuhURL,
            gameUiHTML,
            sourcePath
        } = ob;
        
        if (sourcePath) {
            window.currentWorldSourcePath = sourcePath;
            const newUrl = new URL(window.location);
            
            const decodedPath = decodeURIComponent(sourcePath);
            const levelMatch = decodedPath.match(/worlds\/([^/]+)\.js$/) || decodedPath.match(/\/([^/]+)\.js$/);
            const alias = window.curAlias || newUrl.searchParams.get('alias');

            if (levelMatch && levelMatch[1] && alias) {
                const levelName = levelMatch[1];
                newUrl.searchParams.delete('path'); 
                newUrl.searchParams.set('alias', alias);
                newUrl.searchParams.set('level', levelName);
            } else {
                newUrl.searchParams.set('path', sourcePath);
            }
            
            window.history.pushState({ path: sourcePath }, '', newUrl);
        } else {
            window.currentWorldSourcePath = null;
        }

        if (gameUiHTML) {
            this.gameUiHTML = gameUiHTML;
        }

        var self = this;
        var ghtml = worldDayuh?.html || {};
        Object.assign(ghtml, self.gameUiHTML);

        var windowVars = {};
        
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
                    } catch(parseError) {
                         console.warn("B\"H - ⚡ INTENSE WARNING: Error parsing settings JSON", parseError);
                    }
                }
            } catch (e) {
                console.warn("B\"H - ⚡ INTENSE WARNING: Could not load player settings (Network error):", e);
            }
        }

        var systemInfo = {
            html: ghtml,
            gameState: this.gameState,
            windowVars,
            
            set: {
                playerSettings: playerSettings,
                curAlias: window.curAlias || null 
            },
            
            // Only pass URL if it's explicitly provided. 
            // If worldDayuh is an object, the worker won't try to fetch anything.
            ...(worldDayuhURL ? { worldDayuhURL } : {}),
        };

        // B"H: If the pure object is provided, ensure it's fully passed into userInfo!
        var userInfo = {};
        if (worldDayuh && typeof worldDayuh === 'object') {
            userInfo = { ...worldDayuh };
        }

        var heescheelObj = {
            userInfo,
            systemInfo
        };

        var canvas = this.ui.$g("canvasEssence");

        if (!canvas) {
            alert("Couldn't find canvas, not starting");
            return;
        }

        console.log("B\"H - ⚡ INTENSE LOG: Dispatching Creation Payload to Worker:", heescheelObj);

        var man = new OlamWorkerManager(
            "./ckidsAwtsmoos/Olam/oyved.js", 
            {
                async pawsawch() {
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
};
