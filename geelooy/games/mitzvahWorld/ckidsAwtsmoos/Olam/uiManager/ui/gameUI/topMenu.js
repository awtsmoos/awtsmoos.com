
// B"H
import loginBtn from "../loginBtn.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default {
    shaym: "menuTop",
    className: "menuTop",
    style: { 
        top: "0px", 
        background: "transparent", 
        backdropFilter: "none", 
        pointerEvents: "none", // Let clicks pass through empty space
        height: "60px",
        padding: "10px"
    },
    children: [{
        shaym: "menu button",
        className: "menuBtn",
        style: { pointerEvents: "auto", background: "rgba(0,0,0,0.5)", borderRadius: "50%", padding: "5px", width: "32px", height: "32px", display: "flex", justifyContent: "center", alignItems: "center" },
        innerHTML: /*html*/
        `
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M4 16H28" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 8H28" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 24H28" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <rect class="menuBtnRect" x="0" y="0" width="100%" height="100%" fill="transparent" />
                </svg>
        `,
        awtsmoosClick: true,
        onclick(e, $) {
            var m = $("menu") || document.querySelector(".gameMenu");
            
            if (!m) {
                if (window.mana && window.mana.uiManager) {
                    window.mana.uiManager.makeGameMenu();
                    setTimeout(() => {
                         m = $("menu") || document.querySelector(".gameMenu");
                         if (m) {
                             m.classList.remove("offscreen");
                             m.classList.add("onscreen");
                         }
                    }, 50);
                    return;
                }
            }
            
            if (m) {
                if (m.classList.contains("offscreen")) {
                    m.classList.remove("offscreen");
                    m.classList.add("onscreen");
                } else {
                    m.classList.remove("onscreen");
                    m.classList.add("offscreen");
                }
            }
        }
    },
    // B"H: Login button is kept but styled to float
    {
        ...loginBtn,
        style: { pointerEvents: "auto", position: "absolute", top: "15px", right: "15px" }
    }
    ]
};
