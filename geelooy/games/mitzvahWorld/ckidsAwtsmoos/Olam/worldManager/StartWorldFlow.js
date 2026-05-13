// B"H
/**
 * @file StartWorldFlow.js
 * @description
 * THE UTTERANCE OF THE FIRST WORD.
 *
 * "By the word of the Lord the heavens were made..."
 *
 * This mixin assembles world payloads, creates OlamWorkerManager,
 * and speaks the pawsawch (first word) once vessel_ready fires.
 * Also resets uiManager.started so future worlds load cleanly.
 *
 * @mixin StartWorldFlow
 */

import OlamWorkerManager from "../ikarOyvedManager.js";

const StartWorldFlow = {
    /**
     * @async
     * @function startWorld
     * @param {Object} ob
     * @returns {boolean}
     */
    async startWorld(ob = {}) {
        const { worldDayuh, worldDayuhURL, gameUiHTML, sourcePath } = ob;

        // B"H: silent


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

        // B"H: Allow fresh world to call onstart via initializeForFirstTime
        if (this.uiManager) {
            this.uiManager.started = false;
        }

        const manager = new OlamWorkerManager(
            `/games/mitzvahWorld/ckidsAwtsmoos/Olam/oyved/index.js?v=${Date.now()}`,
            {
                async pawsawch() {
                    // B"H: silent

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

        // B"H: Soft diagnostic only - no timeouts that destroy the world
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

    /** @param {string} path */
    _rectifyHistory(path) {
        window.currentWorldSourcePath = path;
        const url = new URL(window.location);
        url.searchParams.set("path", path);
        window.history.pushState({ path }, "", url);
    },

    /** @returns {Object|null} */
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
