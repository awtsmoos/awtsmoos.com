
//B"H
import { isAliasInline, getInlineAliases, hideCommentsInline } from "./inline/state.js";
import { manifestCommentIndicators } from "./inline/indicators.js";
import { showSectionCommentaryInline, renderThreadContent } from "./inline/threading.js";
import { addCommentsInline, createAndPlaceRootCommentHolder, toggleInlineForComments } from "./inline/placement.js";

// Global Access
window.awtsmoosInline = {
    refreshSectionCommentary: async (idx, sub) => {
        const subKey = (sub !== null && sub !== undefined) ? sub : 'main';
        const threadId = `${idx}-${subKey}`;
        const container = document.querySelector(`.awtsmoos-inline-thread[data-unique-thread="${threadId}"]`);
        if (container) {
            await renderThreadContent(container, idx, sub);
        }
    }
};

export {
    isAliasInline,
    getInlineAliases,
    hideCommentsInline,
    toggleInlineForComments,
    manifestCommentIndicators,
    showSectionCommentaryInline,
    addCommentsInline,
    createAndPlaceRootCommentHolder,
    renderThreadContent
};
