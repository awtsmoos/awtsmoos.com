// B"H
/**
 * @module ControlBindings
 * @description
 * Chapter 4: Small controls receive small chambers. Font, color, and reset
 * bindings stay separate from navigation so no listener grows into a beast.
 */

import { adjustFontSize } from "../../functions/utils.js";

/** Binds typography plus/minus buttons. */
export function setupFontControls() {
    const fontInc = document.getElementById("fontIncreaseBtn");
    const fontDec = document.getElementById("fontDecreaseBtn");
    if (fontInc) fontInc.onclick = event => {
        event.preventDefault();
        event.stopPropagation();
        adjustFontSize("increase");
    };
    if (fontDec) fontDec.onclick = event => {
        event.preventDefault();
        event.stopPropagation();
        adjustFontSize("decrease");
    };
}

/** Binds live color controls to CSS variables. */
export function setupColorControls() {
    document.querySelectorAll('.color-control input[type="color"]').forEach(input => {
        input.addEventListener("input", event => {
            const cssVar = event.target.dataset.cssVar;
            document.querySelector(".post-reader-localized-context")?.style.setProperty(cssVar, event.target.value);
        });
    });
}

/** Binds the reset button to clear appearance storage. */
export function setupResetButton() {
    const resetBtn = document.getElementById("resetDefaultsBtn");
    if (!resetBtn) return;
    resetBtn.addEventListener("click", () => {
        if (!confirm("B\"H - Restore factory appearance settings? This will clear your custom alchemy.")) return;
        [
            "awtsmoos-theme", "awtsmoos-font", "currentPostFontSize",
            "awtsmoos-custom-themes", "awtsmoos-sidebar-visible", "awtsmoos-active-tab"
        ].forEach(key => localStorage.removeItem(key));
        window.location.reload();
    });
}
