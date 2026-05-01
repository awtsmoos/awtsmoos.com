
/**
 * B"H
 * UI Manager - Initialization Logic
 */
import style from "../ui/style.js";
import mainMenu from "../ui/mainMenu.js";

export default {
    UI(opts={}) {
        var self = this;
        var onstart = opts.onstart;
        // B"H: Create clean UI instance
        var ui = new this.UIClass(); 
        this.ui = ui;
        
        var h = ui.html({
            shaym: "ikar",
            children: [
                style,
                ...mainMenu
            ]
        });

        var first = false;
        
        function start(e) {
            self.initializeForFirstTime(e, {
                onstart,
                onerror(e) {
                    alert("There was an error "+e)
                    ui.htmlAction({
                        shaym: "loading",
                        properties: {
                            innerHTML: "There was an error. Check console, contact Coby."
                        }
                    })
                }
            })
        }

        h?.addEventListener("start", async e => {
            if(!first) {
                first = true;
                start(e)
            } else {
                self.initializeForFirstTime(e, { onstart })
            }
        });

        h?.addEventListener("olamPeula", peula => {
            var det = peula.detail;
            const manager = window.mana;
            if(manager && manager.socket && manager.socket.eved && det) {
                Object.keys(det).forEach(w => {
                    manager.socket.eved.postMessage({ [w]: det[w] })
                })
            }
        })

        document.body.appendChild(h)
        return ui;
    },

    initializeForFirstTime(e, opts={}) {
        var onstart = opts.onstart;
        var ui = this.ui;
        
        var mainAv = ui.html({
            shaym: "main av",
            className: "mainAv"
        });

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
}
