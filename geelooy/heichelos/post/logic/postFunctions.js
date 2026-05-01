
/**
 * B"H
 * @module GrandAggregator
 * @chapter The Reshuffling of the Twelve Tribes
 * @description
 * This is the Grand Station, the central Hub (Yesod) through 
 * which all specialized logic flows to the main application. 
 * Because the browser sought this file at this specific coordinate 
 * (post/logic/postFunctions.js), we establish this aggregator here, 
 * uniting all the sub-modules created from the split.
 * 
 * No detail is left out. The Kav is straight and true.
 */

// 1. Text & Linguistic Identification
export { 
    isHebrewWord, 
    isFirstCharacterHebrew, 
    containsHebrew 
} from "../functions/text/LinguisticSpeech.js";

// 2. Text Purification
export { 
    stripTags, 
    sanitizeContent 
} from "../functions/text/Purification.js";

// 3. Manifestation Rituals (DOM)
export { 
    appendHTML, 
    appendWithSubChildren 
} from "../functions/dom/ManifestationRitual.js";

// 4. Dimensionality & Scaling (UI)
export { 
    adjustFontSize, 
    loadFontSize 
} from "../functions/ui/Dimensionality.js";

// 5. Navigation & Coordination
export { 
    updateQueryStringParameter, 
    getLinkHrefOfEditing 
} from "../functions/interaction/CoordinateInteraction.js";

// 6. Inherited Aggregates
// B"H - Ensuring existing sub-module logic is also projected through this lens
export { 
    makeInfoHTML, 
    showCustomContextMenu, 
    makeNavBars, 
    makeToast 
} from "../functions/ui.js";

export { 
    interpretPostDayuh, 
    generateSection 
} from "./scribe.js";

export { 
    startHighlighting, 
    scrollToActiveEl, 
    initializeFootnotes,
    weaveDropdownFromAwtsmoos,
    createFootnoteOverlay
} from "../functions/interaction.js";

export { 
    addTab 
} from "../functions/tabs.js";

/**
 * @method GlobalContextInitialization
 * @description
 * Binds the seeker's right-click to the Custom Command menu if they are 
 * gazing upon the Revelation.
 */
document.addEventListener("contextmenu", function(e) {
    const context = e.target.closest('.post-reader-localized-context');
    if (context) {
        e.preventDefault();
        import("../functions/ui.js").then(module => {
            module.showCustomContextMenu(e.pageX, e.pageY, e);
        });
    }
});

console.log("B\"H - [GrandAggregator] Station is manifest at /post/logic/postFunctions.js.");
