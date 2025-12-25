
//B"H
import { updateQueryStringParameter } from "../../functions/utils.js";
import { showSectionCommentaryInline } from "./threading.js";

/**
 * @method manifestCommentIndicators
 * @description B"H - Lights the flames. Also checks for Deep Links on load.
 */
export async function manifestCommentIndicators() {
    const post = window.post;
    if (!post) return;
    
    const { getAndSaveAliases } = await import("../panel.js");
    const sections = document.querySelectorAll('.section');
    
    // Check URL for Deep Link
    const urlParams = new URLSearchParams(window.location.search);
    const targetIdx = urlParams.get('idx');
    const targetSub = urlParams.get('sub');
    const targetCid = urlParams.get('cid'); // Comment ID

    for (const section of sections) {
        const idx = section.dataset.awtsmoosIdx;
        
        // 1. Verse Level
        const mainAliases = await getAndSaveAliases(false, true, idx, null, false);
        if (mainAliases && mainAliases.length > 0) {
            const indicatorSlot = section.querySelector('.awtsmoos-comment-indicator:not(.sub-indicator)');
            if (indicatorSlot) {
                indicatorSlot.innerHTML = `<span class="awtsmoos-flame" title="Verse commentators">🕯️</span>`;
                indicatorSlot.classList.add('visible');
                indicatorSlot.onclick = (e) => {
                    e.stopPropagation();
                    // Update URL params without wiping CID unless we are changing context
                    updateQueryStringParameter("idx", idx);
                    updateQueryStringParameter("sub", null);
                    showSectionCommentaryInline(idx, null, section);
                };
            }
        }

        // 2. Paragraph Level
        const subs = section.querySelectorAll('.sub-awtsmoos');
        for (const subEl of subs) {
            const subIdx = subEl.dataset.awtsmoosSub;
            const subAliases = await getAndSaveAliases(false, true, idx, subIdx, false);
            if (subAliases && subAliases.length > 0) {
                const subIndicator = subEl.querySelector('.awtsmoos-comment-indicator.sub-indicator');
                if (subIndicator) {
                    subIndicator.innerHTML = `<span class="awtsmoos-flame small" title="Paragraph commentators">🕯️</span>`;
                    subIndicator.classList.add('visible');
                    subIndicator.onclick = (e) => {
                        e.stopPropagation();
                        updateQueryStringParameter("idx", idx);
                        updateQueryStringParameter("sub", subIdx);
                        showSectionCommentaryInline(idx, subIdx, subEl);
                    };
                }
            }
        }
    }

    // B"H - Auto-open if deep linked
    if (targetCid && targetIdx !== null) {
        const targetElSelector = targetSub !== null 
            ? `.sub-awtsmoos[data-awtsmoos-sub='${targetSub}']` 
            : `.section[data-awtsmoos-idx='${targetIdx}']`;
        
        const el = document.querySelector(targetElSelector);
        if(el) {
            // Slight delay to ensure layout
            setTimeout(() => showSectionCommentaryInline(targetIdx, targetSub, el), 500);
        }
    }
}
