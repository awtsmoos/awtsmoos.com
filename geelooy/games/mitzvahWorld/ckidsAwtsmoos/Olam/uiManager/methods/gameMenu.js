
/**
 * B"H
 * UI Manager - Game Menu Logic
 */
import gameMenu from "../gameMenu.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import btnBubble from "../ui/resources/btnBubble.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default {
    makeGameMenu() {
        if (!this.ui) {
            console.error("B\"H: UI not initialized in UIManager");
            return;
        }
        
        if (this.ui.$g("menu")) {
            // B"H: silent

            return;
        }

        var par = this.ui.$g("gameID") || document.querySelector(".gameUi");
        
        if (!par) {
            console.warn("B\"H: Parent element 'gameID' (.gameUi) not found yet. Retrying in 500ms...");
            setTimeout(() => this.makeGameMenu(), 500);
            return;
        }
        
        // B"H: silent

     
        var menu = this.ui.html({
            shaym: "menu",
            parent: par,
            className: "gameMenu offscreen",
        })

        window.m = menu;
        if(!Array.isArray(gameMenu)) {
            return // B"H: silent

        }
        gameMenu.forEach(w => {
            this.gameMenuItem(w);
        });
    },

    gameMenuItem(opts={}) {
        var gm = this.ui.$g("menu")
        if(!gm) return // B"H: silent


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
