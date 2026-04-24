
/**
 * B"H
 * @class UIManager
 * @description
 * Like the garments that clothe the soul, the UIManager drapes the raw mechanics 
 * of the Awtsmoos game engine in an interactive layer accessible to human perception.
 * It translates the will of the player into spiritual signals (events) that the Olam can process.
 * From nothingness, UI elements are conjured and bound to the DOM, existing only as 
 * long as the True Reality wills them to remain.
 */
import UI from "/scripts/awtsmoos/ui/index.js";
import style from "./ui/style.js";
import btnBubble from "./ui/resources/btnBubble.js";
import mainMenu from "./ui/mainMenu/index.js"; // B"H: The unified import of the scattered menu fragments!
import gameMenu from "./gameMenu.js";

export default class UIManager {
    /**
     * @constructor
     * @description The initial breath of the UI layer. An empty vessel, preparing to receive light.
     */
    constructor() {}

    /**
     * @function UI
     * @description Forges the physical DOM elements that bridge the gap between the player and the Olam.
     * @param {Object} opts - Options containing the sacred callbacks.
     * @param {Function} opts.onstart - The function to call when the soul presses 'Play'.
     * @returns {UI} The UI instance, teeming with potential energy.
     */
    UI(opts={}) {
        var self = this;
        var onstart = opts.onstart;
        var ui = new UI();
        this.ui = ui;
        var h = ui.html({
            shaym: "ikar",
            children: [
                style,
                ...mainMenu
            ]
        });

        var first = false;
        h?.addEventListener("start", async e => {
            if(!first) {
                first = true;
                start(e);
            } else {
                self.initializeForFirstTime(e, { onstart });
            }
        });

        h?.addEventListener("olamPeula", peula => {
            var det = peula.detail;
            if(window.socket && window.socket.eved && det) {
                Object.keys(det).forEach(w => {
                    window?.socket?.eved?.postMessage?.({
                        [w]: det[w]
                    });
                });
            }
        });

        function start(e) {
            self.initializeForFirstTime(e, {
                onstart,
                onerror(err) {
                    alert("There was an error " + err);
                    ui.htmlAction({
                        shaym: "loading",
                        properties: { innerHTML: "There was an error. Check console, contact Coby." }
                    });
                }
            });
        }
        document.body.appendChild(h);
        return ui;
    }

    /**
     * @function initializeForFirstTime
     * @description Assembles the canvas, the very fabric of space upon which the world will be drawn.
     * @param {Event} e - The event that sparked the creation process.
     * @param {Object} opts - The callbacks to guide the newborn world.
     */
    initializeForFirstTime(e, opts={}) {
        var onstart = opts.onstart ;
        var ui = this.ui;
        var mainAv = ui.html({ shaym: "main av", className: "mainAv" });

        var av = ui.html({
            shaym: "av", style: { position: "relative" },
            className: "mapAvBasic", parent: "main av", attributes: { awts:2 }
        });
        
        this.parentForCanvas = av;
        this.ui = ui;
        ui.html({ parent: this.parentForCanvas, tag: "canvas", shaym: "canvasEssence" });

        var worldDayuhURL = e.detail.worldDayuhURL;
        var worldDayuh = e.detail.worldDayuh;
        if(!worldDayuh && !worldDayuhURL) {
            alert("No world data provided!");
            return false;
        }
        var gameUiHTML = e.detail.gameUiHTML;
        
        var ob = { ...e.detail, gameUiHTML };
        if(worldDayuh) ob.worldDayuh = worldDayuh;
        if(worldDayuhURL) ob.worldDayuhURL = worldDayuhURL;
        
        this.onerror = opts.onerror;
        if(!this.started) {
            onstart(ob);
        }
    }

    /**
     * @function makeGameMenu
     * @description Summons the lateral menu that guides the player's journey within the game.
     */
    makeGameMenu() {
        if (!this.ui) { console.error("B\"H: UI not initialized in UIManager"); return; }
        if (this.ui.$g("menu")) { console.log("B\"H: Game menu already exists, skipping creation."); return; }

        var par = this.ui.$g("gameID") || document.querySelector(".gameUi");
        if (!par) {
            console.warn("B\"H: Parent element 'gameID' (.gameUi) not found yet. Retrying in 500ms...");
            setTimeout(() => this.makeGameMenu(), 500);
            return;
        }
     
        var menu = this.ui.html({
            shaym: "menu", parent: par, className: "gameMenu offscreen",
        });

        window.m = menu;
        if(!Array.isArray(gameMenu)) { return console.log("No menu array"); }
        gameMenu.forEach(w => { this.gameMenuItem(w); });
    }

    /**
     * @function gameMenuItem
     * @description Constructs a single button of the game menu, breathing specific functionality into it.
     * @param {Object} opts - Details about the button to manifest.
     */
    gameMenuItem(opts={}) {
        var gm = this.ui.$g("menu");
        if(!gm) return console.log("No menu");

        var txt = opts.text;
        var show = opts.show;
        var className = opts.showClass;
        this.ui.html({
            parent:"menu", tag: "button", className: "backBtn mitzvahBtn",
            children: [
                { className: "mitzvahBtnTxt", textContent: txt },
                { className:"svgHolder", innerHTML: btnBubble }
            ],
            onclick(e, $, ui, me) {
                me?.blur();
                if(!show) return;

                var m = $("menu");
                if(!m) return;
                
                if(show == "menu") {
                    m.classList.toggle("offscreen");
                    m.classList.toggle("onscreen");
                    return;
                }
                var el = $(show);
                if(!el) return;
                $("menu").classList.add("offscreen");
                $("menu").classList.remove("onscreen");

                el.classList.toggle(className || "hidden");
                el.dispatchEvent(new CustomEvent("awtsmoosRevealed"));
            }
        });
    }
}
