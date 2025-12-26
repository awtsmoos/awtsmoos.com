//B"H
import { updateQueryStringParameter } from "../functions/utils.js";

/**
 * Sets up global UI interaction listeners.
 */
export function setupUIListeners() {
    document.addEventListener("click", (e) => {
        // Commentary Toggle
        const commentBtn = e.target.closest("#commentaryBtn");
        if (commentBtn) {
            e.stopPropagation();
            const sidebar = document.querySelector(".sidebar");
            if (sidebar) {
                const isHidden = sidebar.classList.contains("hidden-comments");
                sidebar.classList.toggle("hidden-comments");
                commentBtn.classList.toggle("pushed", isHidden);
                if (isHidden) window.dispatchEvent(new CustomEvent("awtsmoos index"));
            }
            return;
        }

        // Font Settings Toggle
        const minMaxBtn = e.target.closest("#minMax");
        if (minMaxBtn) {
            e.stopPropagation();
            const postDetails = document.getElementById("postDetails");
            if (postDetails) {
                const isHidden = postDetails.classList.contains("hidden-details");
                postDetails.classList.toggle("hidden-details");
                minMaxBtn.classList.toggle("pushed", isHidden);
            }
        }
    });

    window.openPanel = () => {
        const sidebar = document.querySelector(".sidebar");
        if (sidebar && sidebar.classList.contains("hidden-comments")) {
            sidebar.classList.remove("hidden-comments");
            document.getElementById("commentaryBtn")?.classList.add("pushed");
        }
    };
}

export async function setupHighlightingLogic() {
    const { startHighlighting } = await import("../functions/interaction.js");
    startHighlighting("realPost", {
        onSection: (section) => {
            if (!section) return;
            const idx = section.dataset.awtsmoosIdx;
            updateQueryStringParameter("idx", idx);
            window.dispatchEvent(new CustomEvent("awtsmoos index", { detail: { idx } }));
        }
    });
}