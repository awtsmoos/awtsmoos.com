//B"H
import { updateQueryStringParameter } from "../functions/utils.js";

/**
 * UI Listeners - The Vessels of Interaction.
 * Uses event delegation for maximum reliability.
 */
export function setupUIListeners() {
    // We attach to document to ensure we catch clicks even if elements are created later
    // or if the script runs before the DOM is fully ready (though unlikely with type=module).
    document.addEventListener("click", (e) => {
        
        // 1. Commentary (Sidebar) Toggle
        const commentBtn = e.target.closest("#commentaryBtn");
        if (commentBtn) {
            e.stopPropagation();
            const sidebar = document.querySelector(".sidebar");
            if (sidebar) {
                const isHidden = sidebar.classList.contains("hidden-comments");
                sidebar.classList.toggle("hidden-comments");
                commentBtn.classList.toggle("pushed", isHidden);
                
                // Dispatch resize event or custom event if needed for layout adjustments
                if (isHidden) {
                    window.dispatchEvent(new CustomEvent("awtsmoos index"));
                }
            }
            return;
        }

        // 2. Text Size / Details Toggle
        const minMaxBtn = e.target.closest("#minMax");
        if (minMaxBtn) {
            e.stopPropagation();
            const postDetails = document.getElementById("postDetails");
            if (postDetails) {
                const isHidden = postDetails.classList.contains("hidden-details");
                postDetails.classList.toggle("hidden-details");
                minMaxBtn.classList.toggle("pushed", isHidden);
            }
            return;
        }

        // 3. Close details when clicking outside
        const postDetails = document.getElementById("postDetails");
        const detailsBtn = document.getElementById("minMax");
        if (postDetails && !postDetails.classList.contains("hidden-details")) {
            if (!postDetails.contains(e.target) && e.target !== detailsBtn) {
                postDetails.classList.add("hidden-details");
                detailsBtn?.classList.remove("pushed");
            }
        }
    });

    // Global helpers
    window.openPanel = () => {
        const sidebar = document.querySelector(".sidebar");
        const btn = document.getElementById("commentaryBtn");
        if (sidebar && sidebar.classList.contains("hidden-comments")) {
            // Simulate click to ensure consistency
            if(btn) btn.click();
            else sidebar.classList.remove("hidden-comments");
        }
    };

    window.openPanelToComments = async () => {
        window.openPanel();
        if (window.commentTab) {
            window.commentTab.open();
        }
    };
}

/**
 * Highlighting Logic - The Pulse of Revelation.
 * @method setupHighlightingLogic
 */
export async function setupHighlightingLogic() {
    try {
        const { startHighlighting } = await import("../functions/interaction.js");
        startHighlighting("realPost", {
            onSection: (section) => {
                if (!section) return;
                const idx = section.dataset.awtsmoosIdx;
                const activeSub = section.querySelector('.sub-awtsmoos.active');
                const sub = activeSub ? activeSub.dataset.awtsmoosSub : null;

                updateQueryStringParameter("idx", idx);
                updateQueryStringParameter("sub", sub);

                window.dispatchEvent(new CustomEvent("awtsmoos index", {
                    detail: { idx, sub }
                }));
            },
            onParagraph: (paragraph) => {
                if (!paragraph) return;
                const sub = paragraph.dataset.awtsmoosSub;
                updateQueryStringParameter("sub", sub);

                window.dispatchEvent(new CustomEvent("awtsmoos index", {
                    detail: { sub }
                }));
            }
        });
    } catch(e) {
        console.warn("Highlighter failed to load:", e);
    }
}