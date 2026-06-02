// B"H
/**
 * @file postLogic.js
 * @description
 * Chapter 72: Before the reader ignites, the Awtsmoos breaks the last scroll
 * chain. Some outer routes and mobile browsers leave ancestors fixed or hidden;
 * this entry point repairs document scrolling before and after bootstrap so the
 * main Torah river can move even when panels open and close.
 */

import { ignite } from "./logic/initialization/bootstrap.js";

function repairScrollVessel() {
    const html = document.documentElement;
    const body = document.body;
    const root = document.querySelector(".post-reader-localized-context");
    [html, body].forEach(node => {
        if (!node) return;
        node.classList.add("awtsmoos-reader-scroll-repaired");
        node.style.setProperty("overflow-y", "auto", "important");
        node.style.setProperty("overflow-x", "hidden", "important");
        node.style.setProperty("height", "auto", "important");
        node.style.setProperty("max-height", "none", "important");
        node.style.setProperty("position", "static", "important");
        node.style.setProperty("touch-action", "pan-y", "important");
    });
    if (root) {
        root.style.setProperty("position", "relative", "important");
        root.style.setProperty("height", "auto", "important");
        root.style.setProperty("max-height", "none", "important");
        root.style.setProperty("overflow-y", "visible", "important");
        root.style.setProperty("touch-action", "pan-y", "important");
    }
}

async function begin() {
    repairScrollVessel();
    await ignite();
    repairScrollVessel();
    setTimeout(repairScrollVessel, 250);
    setTimeout(repairScrollVessel, 1200);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", begin, { once: true });
} else {
    begin();
}
