//B"H
/**
 * Comment Indicator Logic.
 * Lighting the flames of commentary with high-intensity feedback.
 */
import { updateQueryStringParameter } from "/heichelos/post/functions/utils.js";
import { showSectionCommentaryInline } from "/heichelos/post/comments/inline/threading.js";

/**
 * @method manifestCommentIndicators
 * @description B"H - Lights the flames. Also checks for Deep Links on load.
 */
export async function manifestCommentIndicators() {
    const post = window.post;
    if (!post) return;
    
    const { getAndSaveAliases } = await import("/heichelos/post/comments/panel.js");
    const sections = document.querySelectorAll('.section');
    
    // Check URL for Deep Link
    const urlParams = new URLSearchParams(window.location.search);
    const targetIdx = urlParams.get('idx');
    const targetSub = urlParams.get('sub');
    const targetCid = urlParams.get('cid');

    for (const section of sections) {
        const idx = section.dataset.awtsmoosIdx;
        
        // 1. Verse Level
        const mainAliases = await getAndSaveAliases(false, true, idx, null, false);
        if (mainAliases && mainAliases.length > 0) {
            const indicatorSlot = section.querySelector('.awtsmoos-comment-indicator:not(.sub-indicator)');
            if (indicatorSlot) {
                indicatorSlot.innerHTML = `<span class="awtsmoos-flame comment-chip-action" title="Open Insight Thread">🕯️</span>`;
                indicatorSlot.classList.add('visible');
                
                // Absolute Event Binding
                indicatorSlot.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
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
                    subIndicator.innerHTML = `<span class="awtsmoos-flame comment-chip-action resonance" title="Open Paragraph Insights">🕯️</span>`;
                    subIndicator.classList.add('visible');
                    
                    subIndicator.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateQueryStringParameter("idx", idx);
                        updateQueryStringParameter("sub", subIdx);
                        showSectionCommentaryInline(idx, subIdx, subEl);
                    };
                }
            }
        }
    }

    // B"H - Auto-open Deep Link
    if (targetCid && targetIdx !== null) {
        const targetElSelector = (targetSub !== null && targetSub !== "null")
            ? `.sub-awtsmoos[data-awtsmoos-sub='${targetSub}']` 
            : `.section[data-awtsmoos-idx='${targetIdx}']`;
        
        const el = document.querySelector(targetElSelector);
        if(el) {
            setTimeout(() => showSectionCommentaryInline(targetIdx, targetSub, el), 600);
        }
    }
}
