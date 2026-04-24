
/**
 * B"H
 * @file postLogic.js
 * @description The Sovereign Orchestrator.
 * It unites the Scribe, the Alchemist, and the Hunter into a single 
 * chariot for the Revelation. 
 */

import { loadInitial } from "./logic/initialization/coordinates.js";
import { ScribeEngine } from "./logic/engines/ScribeEngine.js";
import { AlchemyEngine } from "./logic/engines/AlchemyEngine.js";
import { HunterEngine } from "./logic/engines/HunterEngine.js";
import { setupUIListeners } from "./logic/listeners.js";

async function ignite() {
    console.log("%c B\"H - [Sovereign Reader] Ignition Initiated.", "color: #ccff00; font-weight: 900;");
    
    try {
        // 1. Gather Initial Divine Coordinates
        const { post, series } = await loadInitial();
        
        const root = document.querySelector(".post-reader-localized-context");
        const viewport = document.getElementById("realPost");
        
        // 2. Activate Alchemy (Styles)
        const alchemist = new AlchemyEngine(root);
        alchemist.transmute();
        window.alchemist = alchemist;

        // 3. Command the Scribe (Rendering)
        const scribe = new ScribeEngine(post);
        await scribe.manifest(viewport);
        
        // 4. Awaken the Hunter (Scrolling)
        const hunter = new HunterEngine(document.querySelector(".scroll-view-wrapper"));
        hunter.awaken();
        window.hunter = hunter;

        // 5. Establish Human Interface
        setupUIListeners();
        
        // 6. Final Polish
        document.title = `BH | ${post.title || "Revelation"}`;
        console.log("B\"H - [Sovereign Reader] Consciousness Manifest.");

    } catch (e) {
        console.error("B\"H - [Ignition Rupture]:", e);
        document.body.innerHTML = `<div class="fatal-error">VOID RUPTURE: ${e.message}</div>`;
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ignite);
} else {
    ignite();
}
