// B"H
/**
 * @module PopoverGate
 * @description
 * Chapter 4: Every small panel receives a boundary. Typography, selection, and
 * click dismissal are gathered here so the global listener stays tiny.
 */

function dismissPopovers(event) {
    if (!event.target.closest(".selection-popover")) {
        const pop = document.getElementById("selection-popover");
        if (pop?.classList.contains("visible")) pop.classList.remove("visible");
    }
    if (!event.target.closest("#typographyDetails") && !event.target.closest("#typographyBtn")) {
        const panel = document.getElementById("typographyDetails");
        const btn = document.getElementById("typographyBtn");
        if (panel && !panel.classList.contains("hidden-details")) {
            panel.classList.add("hidden-details");
            btn?.classList.remove("pushed");
        }
    }
}

function toggleTypography(typeBtn) {
    const panel = document.getElementById("typographyDetails");
    if (!panel) return;
    const shouldOpen = panel.classList.contains("hidden-details");
    panel.classList.toggle("hidden-details", !shouldOpen);
    typeBtn.classList.toggle("pushed", shouldOpen);
}

/**
 * Wires global click routing for sidebar and typography panels.
 * @param {Function} toggleSidebar Sidebar toggle callback.
 */
export function setupGlobalClicks(toggleSidebar) {
    document.body.addEventListener("click", event => {
        const commBtn = event.target.closest("#commentaryBtn");
        if (commBtn) {
            event.preventDefault();
            event.stopPropagation();
            toggleSidebar();
            return;
        }
        const typeBtn = event.target.closest("#typographyBtn");
        if (typeBtn) {
            event.preventDefault();
            event.stopPropagation();
            toggleTypography(typeBtn);
            return;
        }
        dismissPopovers(event);
    }, { passive: false });
}
