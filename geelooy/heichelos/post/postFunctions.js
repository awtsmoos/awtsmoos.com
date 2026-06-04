// B"H
/**
 * @file postFunctions.js
 * @description
 * Chapter 230: The old gate stops summoning the old renderer.
 * This root aggregator used to export the ancient /functions/logic.js renderer,
 * which painted every verse and baby subsection directly into the DOM. Now even
 * legacy imports receive the sovereign virtual scribe from /logic/scribe.js,
 * so there is no split-brain path left for the reader to accidentally awaken.
 */

export { GenesisEngine } from "./functions/dom/GenesisEngine.js";

export {
    appendHTML,
    appendWithSubChildren,
    loadFontSize,
    adjustFontSize,
    isHebrewWord,
    isFirstCharacterHebrew,
    containsHebrew,
    stripTags,
    copyToClipboard,
    updateQueryStringParameter,
    getLinkHrefOfEditing,
    sanitizeContent
} from "./functions/utils.js";

export {
    makeInfoHTML,
    showCustomContextMenu,
    makeNavBars,
    makeToast
} from "./functions/ui.js";

export {
    interpretPostDayuh,
    generateSection
} from "./logic/scribe.js";

export {
    startHighlighting,
    scrollToActiveEl,
    initializeFootnotes,
    weaveDropdownFromAwtsmoos,
    createFootnoteOverlay
} from "./functions/interaction.js";

export { addTab } from "./functions/tabs.js";

function closeAwtsmoosMenus() {
    document.getElementById("custom-context-menu")?.remove();
    document.getElementById("insane-verse-menu")?.remove();
}

document.addEventListener("contextmenu", event => {
    const context = event.target.closest(".post-reader-localized-context");
    if (!context) return;
    event.preventDefault();
    closeAwtsmoosMenus();
    import("./functions/ui.js").then(module => module.showCustomContextMenu(event.clientX, event.clientY, event));
});

document.addEventListener("click", event => {
    if (event.target.closest("#custom-context-menu, #insane-verse-menu")) return;
    closeAwtsmoosMenus();
}, true);

document.addEventListener("touchstart", event => {
    if (event.target.closest("#custom-context-menu, #insane-verse-menu")) return;
    closeAwtsmoosMenus();
}, true);

window.addEventListener("scroll", closeAwtsmoosMenus, { passive: true, capture: true });
window.addEventListener("resize", closeAwtsmoosMenus, { passive: true });

console.log("B\"H - [postFunctions] Root aggregator now delegates to the virtual scribe.");
