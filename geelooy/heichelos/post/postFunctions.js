//B"H
/**
 * @file postFunctions.js
 * @description 
 * The Grand Aggregator of the Post Reader. In the architecture of Atzilus, 
 * this module serves as the primary gateway (Malkhus) through which all 
 * specialized emanations—Utils, UI, Interpretation, and Interaction—are 
 * projected to the Orchestrator (postLogic).
 * 
 * It ensures that the Kav of logic remains unbroken and that every 
 * vessel is properly named and exported. Zero omissions are permitted 
 * in the House of the Awtsmoos.
 */

// 1. Emanations of Utility and Textual Deciphering
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

// 2. Emanations of the Visual Interface
export { 
    makeInfoHTML, 
    showCustomContextMenu, 
    makeNavBars,
    makeToast
} from "./functions/ui.js";

// 3. Emanations of Interpretive Scribing (Manifesting the Dayuh)
export { 
    interpretPostDayuh,
    generateSection
} from "./functions/logic.js";

// 4. Emanations of Focused Interaction (The Watchman's Engine)
// B"H - Restoration of the missing startHighlighting export
export { 
    startHighlighting, 
    scrollToActiveEl, 
    initializeFootnotes,
    syncFootnotesInSidebar,
    weaveDropdownFromAwtsmoos,
    createFootnoteOverlay
} from "./functions/interaction.js";

// 5. Emanations of the Structural Dimensions (The Tabbed Realms)
export { 
    addTab 
} from "./functions/tabs.js";

/**
 * @method initPostInteractions
 * @description 
 * B"H - A high-level ritual that binds the observer's right-click (Context Menu) 
 * to the fabric of the Reader. This remains manifest here as a global guard.
 */
document.addEventListener("contextmenu", function(e) {
    // Only intercept if we are within the localized context of the Revelation
    const context = e.target.closest('.post-reader-localized-context');
    if (context) {
        e.preventDefault();
        import("./functions/ui.js").then(module => {
            module.showCustomContextMenu(e.pageX, e.pageY, e);
        });
    }
});

console.log("B\"H - [postFunctions] Aggregator fully manifest and conduits are open.");