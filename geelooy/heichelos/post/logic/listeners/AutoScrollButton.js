// B"H
/**
 * @module AutoScrollButton
 * @description
 * Chapter 4: The green river-button receives its own keeper. It toggles the
 * scroll, updates its label, and stays scoped away from the sidebar menu.
 */

import { getAutoScrollDownState, toggleAutoScrollDown } from "../../actions/AutoScrollDown.js";

function updateAutoScrollButton(button, active) {
    if (!button) return;
    button.classList.toggle("awtsmoos-auto-scroll-on", active);
    button.setAttribute("aria-pressed", String(active));
    button.title = active ? "Stop auto scroll" : "Auto scroll down";
    const label = button.querySelector(".awtsmoos-auto-scroll-label");
    if (label) label.textContent = active ? "Stop" : "Scroll";
}

/**
 * Creates the floating auto-scroll button once.
 * @returns {HTMLButtonElement} The river-button.
 */
export function ensureAutoScrollButton() {
    let button = document.getElementById("awtsmoosAutoScrollBtn");
    if (button) return button;
    button = document.createElement("button");
    button.id = "awtsmoosAutoScrollBtn";
    button.type = "button";
    button.className = "awtsmoos-auto-scroll-floating awtsmoos-mobile-river awtsmoos-desktop-river";
    button.setAttribute("aria-pressed", "false");
    button.title = "Auto scroll down";
    button.innerHTML = `<span class="awtsmoos-auto-scroll-icon">⬇</span><span class="awtsmoos-auto-scroll-label">Scroll</span>`;
    button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        const active = toggleAutoScrollDown({ speed: 0.95 });
        updateAutoScrollButton(button, active);
    });
    const host = document.querySelector(".post-reader-localized-context") || document.body;
    host.appendChild(button);
    updateAutoScrollButton(button, getAutoScrollDownState().active);
    return button;
}
