
// B"H
/**
 * @file StartWorldFlow.js
 * @description
 * THE UTTERANCE OF THE FIRST WORD.
 *
 * "By the word of the Lord the heavens were made..."
 *
 * @mixin StartWorldFlow
 */

import OlamWorkerManager from "../ikarOyvedManager.js";

const StartWorldFlow = {
    async startWorld(ob = {}) {
        const { worldDayuh, worldDayuhURL, gameUiHTML, sourcePath } = ob;

        if (sourcePath) this._rectifyHistory(sourcePath);

        const systemInfo = {
            html: { ...(worldDayuh?.html || {}), ...(gameUiHTML || {}) },
            gameState: this.gameState,
            set: {
                playerSettings: await this._getPersistentSettings(),
                curAlias: window.curAlias || null
            },
            ...(worldDayuhURL ? { worldDayuhURL } : {})
        };

        const userInfo = (worldDayuh && typeof worldDayuh === "object")
            ? { ...worldDayuh }
            : {};

        const canvas = this.ui.$g("canvasEssence");
        if (!canvas) {
            console.error('B"H - Canvas "canvasEssence" NOT FOUND!');
            return false;
        }

        const managerOfAllWorlds = this;

        if (this.uiManager) {
            this.uiManager.started = false;
        }

        // B"H: ABSOLUTE TIKKUN
        // Removed dynamic timestamp ?v= query string which was causing 
        // the server to return an 'application/json' 404 response instead of the JS file!
        const manager = new OlamWorkerManager(
            `/games/mitzvahWorld/ckidsAwtsmoos/Olam/oyved/index.js`,
            {
                async pawsawch() {
                    manager.postMessage({
                        type: "pawsawch",
                        payload: { userInfo, systemInfo }
                    });
                }
            },
            canvas,
            this.ui
        );

        manager._managerOfAllWorlds = managerOfAllWorlds;
        this.socket = manager;
        this.setOnmessage();

        setTimeout(() => {
            if (!manager._vesselIsReady) {
                console.warn('B"H - Diagnostic: Worker has not sent vessel_ready after 45s.');
            } else if (!manager._pawsawchDispatched) {
                console.warn('B"H - Diagnostic: vessel_ready received but pawsawch not dispatched.');
            } else if (!manager._canvasTransferred) {
                console.warn('B"H - Diagnostic: Canvas not yet transferred. Meshes still forging!');
            }
        }, 45000);

        return true;
    },

    _rectifyHistory(path) {
        window.currentWorldSourcePath = path;
        const url = new URL(window.location);
        url.searchParams.set("path", path);
        window.history.pushState({ path }, "", url);
    },

    async _getPersistentSettings() {
        if (!window.curAlias) return null;
        try {
            const p = encodeURIComponent("desktop.folder/game data.folder/playerData.json");
            const res = await fetch(
                `/api/social/aliases/${window.curAlias}/fileSystem/readFile?path=${p}`
            );
            if (res.ok) {
                const json = await res.json();
                return (json && !json.error) ? json : null;
            }
            return null;
        } catch (e) {
            return null;
        }
    }
};

export default StartWorldFlow;
