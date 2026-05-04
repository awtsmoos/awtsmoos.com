
/**
 * B"H
 * @module AdminControls
 * @description
 * Power (Gevurah) is required to manage the library. This module 
 * contains the rituals for assigning new Guardians (Editors) 
 * and materializing the buttons of creation (Submit).
 */

import { HeichelState } from "./HeichelState.js";

export class AdminControls {
    static removeAdminButtons() {
        if (!window.adminBtns) return;
        window.adminBtns.forEach(w => {
            if (w.parentNode) w.parentNode.removeChild(w);
        });
        window.adminBtns =[];
    }

    static addSubmitButtons() {
        window.hasAdminButtons = true;
        if (!window.adminBtns) window.adminBtns =[];

        // Post Submit
        const ps = document.createElement("button");
        ps.innerText = "Submit Post";
        ps.onclick = () => {
            const p = new URLSearchParams({
                type: "post", returnURL: location.href, seriesId: HeichelState.series
            });
            location.href = "/heichelos/" + HeichelState.heichelID + "/submit?" + p;
        };
        const postsTarget = document.querySelector(".posts");
        if(postsTarget) postsTarget.appendChild(ps);
        window.adminBtns.push(ps);

        // Series Submit
        const s = document.createElement("button");
        s.innerText = "Submit New Series";
        s.onclick = () => {
            const p = new URLSearchParams({
                type: "series", returnURL: location.href, seriesId: HeichelState.series
            });
            location.href = "/heichelos/" + HeichelState.heichelID + "/submit?" + p;
        };
        const seriesTarget = document.querySelector(".series");
        if(seriesTarget) seriesTarget.appendChild(s);
        window.adminBtns.push(s);

        // Edit Series
        const ss = document.createElement("button");
        ss.innerText = "Edit Series";
        ss.onclick = () => {
            const p = new URLSearchParams({
                type: "series", returnURL: location.href, id: HeichelState.series
            });
            location.href = "/heichelos/" + HeichelState.heichelID + "/edit?" + p;
        };
        const sControls = document.getElementById("seriesControls");
        if(sControls) sControls.appendChild(ss);
        window.adminBtns.push(ss);

        // Edit Heichel
        const hBtn = document.createElement("a");
        hBtn.innerText = "Edit Heichel Details";
        const k = new URL(location.origin + "/heichelos/manage-alias-heichelos");
        k.search = new URLSearchParams({
            alias: window.curAlias, returnURL: location.href, heichel: HeichelState.heichelID, action: "update"
        });
        hBtn.href = k.toString();
        const hdTarget = document.querySelector(".heichelDetails");
        if(hdTarget) hdTarget.appendChild(hBtn);
        window.adminBtns.push(hBtn);
    }
}
