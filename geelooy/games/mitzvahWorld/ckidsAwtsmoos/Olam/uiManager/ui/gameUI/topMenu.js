
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
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M4 16H28" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 8H28" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 24H28" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <rect class="menuBtnRect" x="0" y="0" width="100%" height="100%" />
                </svg>
                `,
        ready(me, $) {
            var rd = me.getElementsByClassName("btn")[0];
            if (!rd) return;
            rd.onclick = me.onclick;
        },
        onclick(e, $) {
            var m = $("menu");
            if (!m) return;
            m.classList.toggle("offscreen");
            m.classList.toggle("onscreen");
        }
    }, {
        shaym: "title text holder",
        className: "titleTxt",
        children: [{ tag: "span", textContent: "Mitzvah", className: "mtz" }, { tag: "span", textContent: "World" }, { shaym: "Debug", className: "hidden", textContent: "Debugging" }]
    }, loginBtn 
    ],
    style: { top: "0px" },
};
