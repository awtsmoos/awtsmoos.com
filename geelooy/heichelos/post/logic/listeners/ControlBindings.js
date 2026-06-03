// B"H
/**
 * @module ControlBindings
 * @description
 * Chapter 140: The A-menu controls become living instruments. Font controls
 * now command the real reader variables and then re-center the current verse,
 * so the vessel grows without losing the seeker's place.
 */

import { adjustFontSize } from "../../functions/utils.js";
import { scrollToActiveEl } from "../../functions/interaction/scrolling.js";

const APPEARANCE_KEYS = [
    "awtsmoos-theme",
    "awtsmoos-font",
    "currentPostFontSize",
    "awtsmoos-color---color-ink",
    "awtsmoos-color---bg-vellum",
    "awtsmoos-color---color-primary",
    "awtsmoos-color---color-accent"
];

function context() {
    return document.querySelector(".post-reader-localized-context");
}

function updateDisplay(size = "") {
    const display = document.querySelector(".font-size-display");
    const ctx = context();
    if (!display || !ctx) return;
    const cssSize = size || ctx.style.getPropertyValue("--post-text-size") || getComputedStyle(ctx).getPropertyValue("--post-text-size") || "42px";
    display.textContent = cssSize.trim();
}

function storageKey(cssVar) {
    return `awtsmoos-color-${cssVar}`;
}

function settleReaderAfterScale() {
    requestAnimationFrame(() => {
        window.dispatchEvent(new Event("resize"));
        scrollToActiveEl({ behavior: "auto", block: "center", retries: 8 });
    });
}

/** Binds typography plus/minus buttons. */
export function setupFontControls() {
    const fontInc = document.getElementById("fontIncreaseBtn");
    const fontDec = document.getElementById("fontDecreaseBtn");
    if (fontInc) fontInc.onclick = event => {
        event.preventDefault();
        event.stopPropagation();
        updateDisplay(adjustFontSize("increase"));
        settleReaderAfterScale();
    };
    if (fontDec) fontDec.onclick = event => {
        event.preventDefault();
        event.stopPropagation();
        updateDisplay(adjustFontSize("decrease"));
        settleReaderAfterScale();
    };
    updateDisplay();
}

/** Binds live color controls to CSS variables and local memory. */
export function setupColorControls() {
    const ctx = context();
    document.querySelectorAll('.color-control input[type="color"]').forEach(input => {
        const cssVar = input.dataset.cssVar;
        const saved = localStorage.getItem(storageKey(cssVar));
        if (saved) {
            input.value = saved;
            ctx?.style.setProperty(cssVar, saved);
        }
        input.addEventListener("input", event => {
            const value = event.target.value;
            ctx?.style.setProperty(cssVar, value);
            localStorage.setItem(storageKey(cssVar), value);
        });
    });
}

/** Binds the reset button to clear appearance storage. */
export function setupResetButton() {
    const resetBtn = document.getElementById("resetDefaultsBtn");
    if (!resetBtn) return;
    resetBtn.addEventListener("click", () => {
        if (!confirm("B\"H - Restore factory appearance settings? This will clear your custom alchemy.")) return;
        APPEARANCE_KEYS.forEach(key => localStorage.removeItem(key));
        window.location.reload();
    });
}
