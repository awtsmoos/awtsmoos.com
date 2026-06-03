// B"H
/**
 * @module AutoScrollButton
 * @description
 * Chapter 146: The green river-button drinks from the saved speed spring.
 * The floating button no longer hardcodes slow water. It reads the A-menu
 * throttle and updates whenever the seeker changes the speed.
 */

import { getAutoScrollDownState, loadAutoScrollDownSpeed, toggleAutoScrollDown } from "../../actions/AutoScrollDown.js";

function updateAutoScrollButton(button, active) {
    if (!button) return;
    const speed = getAutoScrollDownState().speed;
    button.classList.toggle("awtsmoos-auto-scroll-on", active);
    button.setAttribute("aria-pressed", String(active));
    button.title = active ? `Stop auto scroll · ${speed.toFixed(2)}x` : `Auto scroll down · ${speed.toFixed(2)}x`;
    const label = button.querySelector(".awtsmoos-auto-scroll-label");
    if (label) label.textContent = active ? "Stop" : "Scroll";
    const speedLabel = button.querySelector(".awtsmoos-auto-scroll-speed");
    if (speedLabel) speedLabel.textContent = `${speed.toFixed(1)}x`;
}

/** Creates the floating auto-scroll button once. */
export function ensureAutoScrollButton() {
    let button = document.getElementById("awtsmoosAutoScrollBtn");
    if (button) return button;
    loadAutoScrollDownSpeed();
    button = document.createElement("button");
    button.id = "awtsmoosAutoScrollBtn";
    button.type = "button";
    button.className = "awtsmoos-auto-scroll-floating awtsmoos-mobile-river awtsmoos-desktop-river";
    button.setAttribute("aria-pressed", "false");
    button.title = "Auto scroll down";
    button.innerHTML = `<span class="awtsmoos-auto-scroll-icon">⬇</span><span class="awtsmoos-auto-scroll-label">Scroll</span><span class="awtsmoos-auto-scroll-speed"></span>`;
    button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        const active = toggleAutoScrollDown({ speed: getAutoScrollDownState().speed });
        updateAutoScrollButton(button, active);
    });
    window.addEventListener("awtsmoos:auto-scroll-speed", () => updateAutoScrollButton(button, getAutoScrollDownState().active));
    const host = document.querySelector(".post-reader-localized-context") || document.body;
    host.appendChild(button);
    updateAutoScrollButton(button, getAutoScrollDownState().active);
    return button;
}
