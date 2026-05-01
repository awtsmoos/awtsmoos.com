
/**
 * B"H
 * @module CommentConductor
 * @chapter Orchestrating the descent of Wisdom
 * @description
 * Just as the conductor guides the players to bring the hidden music
 * into manifestation, this module guides the UI based on the seeker's 
 * spatial movement through the scroll.
 */

import { updateQueryStringParameter } from "../functions/utils.js";
import { 
    invalidateVerseCache, 
    setCurrentVerse, 
    setCurrentSub, 
    getCurrentVerse, 
    getCurrentSub 
} from "../comments/state.js";
import { 
    makeCommentatorList, 
    openCommentsOfAlias, 
    updateCommentHeader 
} from "../comments/panel.js";
import { manifestAllActiveInlines } from "../comments/inline.js"; // B"H - Pure flow imported

/**
 * @method getIdx
 * @description Extracts Verse coordinate from the browser heavens.
 */
export function getIdx() {
    const params = new URLSearchParams(location.search);
    const val = params.get("idx");
    return val === null ? null : parseInt(val);
}

/**
 * @method getSub
 * @description Extracts Paragraph coordinate from the heavens.
 */
export function getSub() {
    const params = new URLSearchParams(location.search);
    const val = params.get("sub");
    return (val === null || val === "null") ? null : parseInt(val);
}

/**
 * @method reloadRoot
 * @description Purifies and refreshes the current view.
 */
export async function reloadRoot() {
    const verse = getIdx() ?? "root";
    invalidateVerseCache(verse);
    await indexSwitch(true);
}
window.reloadRoot = reloadRoot;

/**
 * @method indexSwitch
 * @description The pivotal ritual triggered when the seeker's location changes.
 * @param {boolean|Object} forceOrEvent - Can be a boolean or a CustomEvent.
 */
export async function indexSwitch(forceOrEvent = false) {
    let idxNum, subNum;
    
    // Parse coordinates from event or direct URL state
    if (forceOrEvent && forceOrEvent.detail) {
        idxNum = forceOrEvent.detail.idx !== undefined ? forceOrEvent.detail.idx : getIdx();
        subNum = forceOrEvent.detail.sub !== undefined ? forceOrEvent.detail.sub : getSub();
    } else {
        idxNum = getIdx();
        subNum = getSub();
    }

    const targetVerse = (idxNum === null) ? "root" : idxNum;
    const isForced = (forceOrEvent === true);
    
    // Efficiency Ritual: Only change if the coordinates are truly new
    if (!isForced && getCurrentVerse() === targetVerse && getCurrentSub() === subNum) {
        return; 
    }
    
    // Update the Book of State
    setCurrentVerse(targetVerse);
    setCurrentSub(subNum);
    
    // Synchronize UI Sefirot (Sidebar)
    if (window.tabManager) {
        const activeTab = window.tabManager.getCurrent();
        if (activeTab?.name === "insights") {
            await makeCommentatorList(activeTab.actual);
        } else if (activeTab?.awtsmoosType === "specific alias comments" && window.currentAliasBeingViewed) {
            await openCommentsOfAlias({ 
                alias: window.currentAliasBeingViewed, 
                actualTab: activeTab.actual, 
                post: window.post 
            });
        }
    }
    
    await updateCommentHeader();

    // B"H - Trigger Singular Marginal Manifestation
    // This delegates perfectly to the resolved Coordinate logic
    await manifestAllActiveInlines();
}

/**
 * B"H - Eternal Guardian. 
 * Listening for coordinate changes across the expanses.
 */
addEventListener("awtsmoos index", indexSwitch);
