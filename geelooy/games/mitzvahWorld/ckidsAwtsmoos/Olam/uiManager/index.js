// B"H
/**
 * @class UIManager
 * @description
 * THE TIKKUN OF THE ETERNAL RETRY LOOP.
 *
 * The old initializeForFirstTime() received gameUiHTML but NEVER called
 * ui.html(gameUiHTML). The #gameID/.gameUi vessel never entered the DOM.
 * makeGameMenu() searched for it every 500ms forever — an infinite loop
 * that prevented the game from EVER loading.
 *
 * THE FIX: Call ui.html(gameUiHTML) right after canvas creation.
 * The vessel is born. makeGameMenu() finds it on the first attempt.
 * The loop is dissolved. The world loads.
 */

import UI from "/scripts/awtsmoos/ui/index.js";
import style from "./ui/style.js";
import btnBubble from "./ui/resources/btnBubble.js";
import mainMenu from "./ui/mainMenu/index.js";
import gameMenu from "./gameMenu.js";

export default class UIManager {
    /** @constructor — empty vessel, awaiting UI() to begin creation */
    constructor() {}

    /**
     * @function UI
     * @description Forges the DOM vessels, attaches event listeners, appends to body.
     * @param {Object} opts
     * @param {Function} opts.onstart
     * @returns {UI}
     */
    UI(opts = {}) {
        var self = this;
        var onstart = opts.onstart;
        var ui = new UI();
        this.ui = ui;

        var h = ui.html({
            shaym: "ikar",
            children: [style, ...mainMenu]
        });

        var first = false;

        h?.addEventListener("start", async e => {
            if (!first) {
                first = true;
                self.initializeForFirstTime(e, {
                    onstart,
                    onerror(err) {
                        alert("There was an error " + err);
                        ui.htmlAction({
                            shaym: "loading",
                            properties: {
                                innerHTML: "There was an error. Check console, contact Coby."
                            }
                        });
                    }
                });
            } else {
                self.initializeForFirstTime(e, { onstart });
            }
        });

        h?.addEventListener("olamPeula", peula => {
            var det = peula.detail;
            if (window.socket && window.socket.eved && det) {
                Object.keys(det).forEach(w => {
                    window?.socket?.eved?.postMessage?.({ [w]: det[w] });
                });
            }
        });

        document.body.appendChild(h);
        return ui;
    }

    /**
     * @function initializeForFirstTime
     * @description
     * THE CRITICAL TIKKUN IS HERE.
     *
     * After creating the canvas, this now calls ui.html(gameUiHTML) to
     * physically manifest the #gameID / .gameUi element into the DOM.
     *
     * Previously this call DID NOT EXIST. makeGameMenu() looped forever.
     * Now the vessel is born before onstart fires. The loop ends.
     *
     * @param {CustomEvent} e
     * @param {Object} opts
     */
    initializeForFirstTime(e, opts = {}) {
        var onstart = opts.onstart;
        var ui = this.ui;

        ui.html({ shaym: "main av", className: "mainAv" });

        var av = ui.html({
            shaym: "av",
            style: { position: "relative" },
            className: "mapAvBasic",
            parent: "main av",
            attributes: { awts: 2 }
        });

        this.parentForCanvas = av;
        this.ui = ui;

        ui.html({
            parent: this.parentForCanvas,
            tag: "canvas",
            shaym: "canvasEssence"
        });

        var worldDayuhURL = e.detail.worldDayuhURL;
        var worldDayuh = e.detail.worldDayuh;

        if (!worldDayuh && !worldDayuhURL) {
            alert("No world data provided!");
            return false;
        }

        var gameUiHTML = e.detail.gameUiHTML || window.awtsmoosGameUI;

        // ================================================================
        // B"H: THE FIX - RENDER gameUiHTML INTO THE DOM RIGHT NOW.
        //
        // This creates #gameID / .gameUi that makeGameMenu() needs.
        // Previously this call DID NOT EXIST causing the infinite loop.
        // ================================================================
        if (gameUiHTML && typeof gameUiHTML === "object" && !ui.$g("gameID")) {
            console.log('B"H - UIManager: Manifesting #gameID/.gameUi into the DOM!');
            ui.html(gameUiHTML);
        }

        var ob = { ...e.detail, gameUiHTML };
        if (worldDayuh) ob.worldDayuh = worldDayuh;
        if (worldDayuhURL) ob.worldDayuhURL = worldDayuhURL;

        this.onerror = opts.onerror;

        if (!this.started) {
            this.started = true;
            onstart(ob);
        }
    }

    /**
     * @function makeGameMenu
     * @description
     * Summons the in-game menu. With the TIKKUN applied above,
     * #gameID/.gameUi already exists. No more infinite loops.
     */
    makeGameMenu() {
        if (!this.ui) {
            console.error('B"H: UI not initialized in UIManager');
            return;
        }

        if (this.ui.$g("menu")) {
            console.log('B"H: Game menu already exists, skipping.');
            return;
        }

        var par = this.ui.$g("gameID") || document.querySelector(".gameUi");

        if (!par) {
            var fallback = window.awtsmoosGameUI;
            if (fallback) {
                console.warn('B"H: makeGameMenu - #gameID missing! Emergency-manifesting...');
                this.ui.html(fallback);
                par = this.ui.$g("gameID") || document.querySelector(".gameUi");
            }
        }

        if (!par) {
            console.warn('B"H: Parent gameID (.gameUi) not found. Retrying in 500ms...');
            setTimeout(() => this.makeGameMenu(), 500);
            return;
        }

        console.log('B"H: Found gameUI parent - creating in-game menu.');

        this.ui.html({
            shaym: "menu",
            parent: par,
            className: "gameMenu offscreen"
        });

        window.m = this.ui.$g("menu");

        if (!Array.isArray(gameMenu)) {
            return console.log("No menu array");
        }

        gameMenu.forEach(w => this.gameMenuItem(w));
    }

    /**
     * @function gameMenuItem
     * @param {Object} opts
     */
    gameMenuItem(opts = {}) {
        var gm = this.ui.$g("menu");
        if (!gm) return console.log("No menu");

        var txt = opts.text;
        var show = opts.show;
        var className = opts.showClass;

        this.ui.html({
            parent: "menu",
            tag: "button",
            className: "backBtn mitzvahBtn",
            children: [
                { className: "mitzvahBtnTxt", textContent: txt },
                { className: "svgHolder", innerHTML: btnBubble }
            ],
            onclick(e, $, ui, me) {
                me?.blur();
                if (!show) return;

                var m = $("menu");
                if (!m) return;

                if (show === "menu") {
                    m.classList.toggle("offscreen");
                    m.classList.toggle("onscreen");
                    return;
                }

                var el = $(show);
                if (!el) return;

                $("menu").classList.add("offscreen");
                $("menu").classList.remove("onscreen");
                el.classList.toggle(className || "hidden");
                el.dispatchEvent(new CustomEvent("awtsmoosRevealed"));
            }
        });
    }
}