// B"H
/**
 * @file postLogic.js
 * @description
 * Chapter 4: The Sovereign Orchestrator Finds The Living Ear.
 *
 * This legacy duplicate reader keeps its local engines, but the listener scroll
 * lives in the active reader corridor at `heichelos/post/logic/listeners.js`.
 * The previous local `./logic/listeners.js` import asked for a file that was
 * not there. Absence can wear JSON in this server, and a module loader refuses
 * that garment. This file now points to the living listener scroll directly.
 *
 * The Awtsmoos is beyond form, yet form must be precise: coordinates ignite,
 * alchemy paints, the scribe manifests, the hunter watches the scroll, and the
 * listener binds the human hand to the page without broken module paths.
 */

import { loadInitial } from "./logic/initialization/coordinates.js";
import { ScribeEngine } from "./logic/engines/ScribeEngine.js";
import { AlchemyEngine } from "./logic/engines/AlchemyEngine.js";
import { HunterEngine } from "./logic/engines/HunterEngine.js";
import { setupUIListeners } from "../../post/logic/listeners.js";

/**
 * Boots the reader once the DOM is ready.
 *
 * @returns {Promise<void>} Resolves after the reader is initialized or rendered failed state.
 */
async function ignite() {
    console.log("%c B\"H - [Sovereign Reader] Ignition Initiated.", "color: #ccff00; font-weight: 900;");

    try {
        const { post } = await loadInitial();
        const root = document.querySelector(".post-reader-localized-context");
        const viewport = document.getElementById("realPost");

        activateAlchemy(root);
        await manifestPost(post, viewport);
        awakenHunter();
        setupUIListeners();
        polishDocument(post);

        console.log("B\"H - [Sovereign Reader] Consciousness Manifest.");
    } catch (error) {
        revealFatalError(error);
    }
}

/**
 * Activates style alchemy and exposes it for debugging.
 *
 * @param {HTMLElement|null} root - Reader root element.
 * @returns {void}
 */
function activateAlchemy(root) {
    const alchemist = new AlchemyEngine(root);
    alchemist.transmute();
    window.alchemist = alchemist;
}

/**
 * Manifests post content into the viewport.
 *
 * @param {object} post - Loaded post payload.
 * @param {HTMLElement|null} viewport - Content viewport.
 * @returns {Promise<void>} Resolves after manifestation.
 */
async function manifestPost(post, viewport) {
    const scribe = new ScribeEngine(post);
    await scribe.manifest(viewport);
}

/**
 * Starts scroll hunting behavior and exposes it for debugging.
 *
 * @returns {void}
 */
function awakenHunter() {
    const hunter = new HunterEngine(document.querySelector(".scroll-view-wrapper"));
    hunter.awaken();
    window.hunter = hunter;
}

/**
 * Updates final document metadata after content loads.
 *
 * @param {object} post - Loaded post payload.
 * @returns {void}
 */
function polishDocument(post) {
    document.title = `BH | ${post.title || "Revelation"}`;
}

/**
 * Replaces the page with a visible fatal error.
 *
 * @param {Error} error - Error thrown during boot.
 * @returns {void}
 */
function revealFatalError(error) {
    console.error("B\"H - [Ignition Rupture]:", error);
    document.body.innerHTML = `<div class="fatal-error">VOID RUPTURE: ${error.message}</div>`;
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ignite);
} else {
    ignite();
}
