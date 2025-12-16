


// B"H
import loginBtn from "../loginBtn.js";

export default {
    shaym: "menuTop",
    className: "menuTop",
    children: [{
        shaym: "menu button",
        className: "menuBtn",
        innerHTML: /*html*/
        `
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" style="pointer-events:none;">
                <path d="M4 16H28" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 8H28" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 24H28" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <rect class="menuBtnRect" x="0" y="0" width="100%" height="100%" fill="transparent" />
                </svg>
        `,
        awtsmoosClick: true,
        onclick(e, $) {
            // Robust lookup for the menu
            var m = $("menu");
            
            if (!m) {
                m = document.querySelector(".gameMenu");
            }
            
            // B"H: SELF-HEALING MECHANISM
            // If menu is missing, create it immediately.
            if (!m) {
                console.log("B\"H: Menu not found. Attempting to force-create it now.");
                if (window.mana && window.mana.uiManager) {
                    window.mana.uiManager.makeGameMenu();
                    // Try to find it again immediately
                    setTimeout(() => {
                         m = $("menu") || document.querySelector(".gameMenu");
                         if (m) {
                             console.log("B\"H: Menu created successfully on retry.");
                             m.classList.remove("offscreen");
                             m.classList.add("onscreen");
                         } else {
                             console.error("B\"H: Failed to create menu even after force call.");
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
    }, {
        shaym: "title text holder",
        className: "titleTxt",
        children: [{ tag: "span", textContent: "Mitzvah", className: "mtz" }, { tag: "span", textContent: "World" }, { shaym: "Debug", className: "hidden", textContent: "Debugging" }]
    }, loginBtn 
    ],
    style: { top: "0px" },
};
