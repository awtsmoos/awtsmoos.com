/**
 * B"H
 * @module HeichelLoader
 * @description
 * The Great Seder Histalshelus (Order of Evolution) begins here.
 * This is the central consciousness of the Heichel. It ties the API, 
 * the Data purification, and the DOM manifestation together.
 */

import { HeichelState } from "./HeichelState.js";
import { HeichelAPI } from "./HeichelAPI.js";
import { StringPurifier } from "./StringPurifier.js";
import { CardBuilder } from "./CardBuilder.js";
import { AdminControls } from "./AdminControls.js";
import { TabController } from "./TabController.js";

window.goto = (url) => {
    location.href = url;
};

export async function start() {
    if (HeichelState.heichelID === "undefined" || !HeichelState.heichelID) {
        alert("B\"H - That heichel doesn't exist!");
        location.href = "/";
        return;
    }

    TabController.init();
    await load(HeichelState.series);
}

async function load(ss) {
    window.heichel = await HeichelAPI.getHeichel(HeichelState.heichelID);
    
    // Check ownership
    window.curAlias = window.curAlias || localStorage.getItem("lastAliasUsed") || null;
    window.ownsIt = await HeichelAPI.doesOwn(window.curAlias, HeichelState.heichelID);
    
    if (window.ownsIt) {
        AdminControls.addSubmitButtons();
    }

    const parentS = document.getElementById("parentS");
    if (parentS) {
        parentS.classList.remove("hidden");
        const breadcrumb = await HeichelAPI.getBreadcrumb(HeichelState.heichelID, ss);
        window.breadcrumb = breadcrumb;
        parentS.innerHTML = "";

        // B"H - Deduplicating the Breadcrumb Trail of Light
        const seenNames = new Set();
        let crumbsAdded = 0;

        for (let i = breadcrumb.length - 1; i >= 0; i--) {
            const w = breadcrumb[i];
            
            // Purify the name and prepare for logic checks
            const rawName = StringPurifier.purify(w?.prateem?.name || w?.name || "");
            if (!rawName) continue;
            
            // Prevent duplicated names like "Root / ... / Root"
            const nameKey = rawName.toLowerCase();
            if (seenNames.has(nameKey)) continue;
            seenNames.add(nameKey);

            if (crumbsAdded > 0) {
                const separator = document.createElement("span");
                separator.className = "crumb-separator";
                separator.innerHTML = " / ";
                parentS.appendChild(separator);
            }

            const a = document.createElement("a");
            a.href = location.pathname + "?" + new URLSearchParams({ view: HeichelState.view, series: w.id });
            a.onclick = (e) => { e.preventDefault(); window.goto(a.href); };
            
            a.innerHTML = rawName;
            parentS.appendChild(a);
            
            crumbsAdded++;
        }
    }

    const root = await HeichelAPI.getSeriesDetails(HeichelState.heichelID, ss);
    if (!root || !Array.isArray(root.posts)) {
        if (ss === "root") return;
        alert("Path not found: " + ss);
        return;
    }

    // B"H Purify and display header details
    const seriesNm = document.getElementById("seriesNm");
    const seriesDesc = document.getElementById("seriesDesc");
    const seriesNameAndInfo = document.getElementById("seriesNameAndInfo");

    if (seriesNm) seriesNm.innerHTML = StringPurifier.purify(root.prateem.name);
    if (seriesDesc) seriesDesc.innerText = StringPurifier.purify(root.prateem.description);
    if (ss !== "root" && seriesNameAndInfo) seriesNameAndInfo.classList.remove("hidden");

    // Load Posts
    const propertyMap = { content: 256, title: true, postId: true, author: true, id: true, seriesId: true, indexInSeries: true };
    const pjs = await HeichelAPI.getPostsDetails(HeichelState.heichelID, root.id, propertyMap);
    
    const postsList = document.getElementById('postsList');
    if (pjs.length) {
        const frag = CardBuilder.build(pjs, "post", ss, root);
        postsList.innerHTML = "";
        postsList.appendChild(frag);
        if (HeichelState.view !== "series") document.getElementById('postsTab')?.click();
    } else {
        postsList.innerHTML = "No posts here yet!";
    }
    document.querySelector(".loadingPosts")?.classList.add("hidden");

    // Load Series
    const sjs = await HeichelAPI.getSubSeriesDetails(HeichelState.heichelID, ss, root.subSeries);
    const seriesList = document.getElementById('seriesList');
    
    if (sjs.length) {
        const frag = CardBuilder.build(sjs, "series", ss, root);
        seriesList.innerHTML = "";
        seriesList.appendChild(frag);
        if (!pjs.length) document.getElementById('seriesTab')?.click();
    } else {
        seriesList.innerHTML = "No series here yet!";
    }
    document.querySelector(".loadingSeries")?.classList.add("hidden");
}

// B"H Listen to alias changes
window.addEventListener("awtsmoosAliasChange", async e => {
    window.curAlias = e?.detail?.id;
    window.ownsIt = await HeichelAPI.doesOwn(window.curAlias, HeichelState.heichelID);
    AdminControls.removeAdminButtons();
    if(window.ownsIt) AdminControls.addSubmitButtons();
});

// B"H Boot the process
document.addEventListener("DOMContentLoaded", start);