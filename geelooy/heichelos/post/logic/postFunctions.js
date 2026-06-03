
/**
 * B"H
 * @module GrandAggregator
 * @chapter The Reshuffling of the Twelve Tribes
 * @description
 * The central station through which the post logic flows. The right-click/touch
 * command now uses viewport coordinates, not page coordinates, so the menu is
 * never born half outside the visible world.
 */

export { isHebrewWord, isFirstCharacterHebrew, containsHebrew } from "../functions/text/LinguisticSpeech.js";
export { stripTags, sanitizeContent } from "../functions/text/Purification.js";
export { appendHTML, appendWithSubChildren } from "../functions/dom/ManifestationRitual.js";
export { adjustFontSize, loadFontSize } from "../functions/ui/Dimensionality.js";
export { updateQueryStringParameter, getLinkHrefOfEditing } from "../functions/interaction/CoordinateInteraction.js";
export { makeInfoHTML, showCustomContextMenu, makeNavBars, makeToast } from "../functions/ui.js";
export { interpretPostDayuh, generateSection } from "./scribe.js";
export { startHighlighting, scrollToActiveEl, initializeFootnotes, weaveDropdownFromAwtsmoos, createFootnoteOverlay } from "../functions/interaction.js";
export { addTab } from "../functions/tabs.js";

function closeFloatingMenus() {
    document.getElementById("custom-context-menu")?.remove();
    document.getElementById("insane-verse-menu")?.remove();
}

document.addEventListener("contextmenu", event => {
    const context = event.target.closest(".post-reader-localized-context");
    if (!context) return;
    event.preventDefault();
    closeFloatingMenus();
    import("../functions/ui.js").then(module => module.showCustomContextMenu(event.clientX, event.clientY, event));
});

document.addEventListener("click", event => {
    if (event.target.closest("#custom-context-menu, #insane-verse-menu")) return;
    closeFloatingMenus();
}, true);

document.addEventListener("touchstart", event => {
    if (event.target.closest("#custom-context-menu, #insane-verse-menu")) return;
    closeFloatingMenus();
}, true);

window.addEventListener("scroll", closeFloatingMenus, { passive: true, capture: true });
window.addEventListener("resize", closeFloatingMenus, { passive: true });

console.log("B\"H - [GrandAggregator] Station is manifest at /post/logic/postFunctions.js.");
