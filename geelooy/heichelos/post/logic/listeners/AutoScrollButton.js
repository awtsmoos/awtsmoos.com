// B"H
/**
 * @module AutoScrollButton
 * @description
 * Chapter 191: The river button speaks the truth of its motion.
 * When inactive it invites Scroll. When flowing it warns Stop. When the human
 * hand rests on the page, it glows Paused until the Awtsmoos resumes the stream.
 */

import { getAutoScrollDownState, loadAutoScrollDownSpeed, toggleAutoScrollDown } from "../../actions/AutoScrollDown.js";

function buttonWords(state) {
    if (!state.active) return { label: "Scroll", title: `Auto scroll down · ${state.speed.toFixed(2)}x`, icon: "⬇" };
    if (state.paused) return { label: "Paused", title: `Release to resume · ${state.speed.toFixed(2)}x`, icon: "⏸" };
    return { label: "Stop", title: `Stop auto scroll · ${state.speed.toFixed(2)}x`, icon: "■" };
}

function updateAutoScrollButton(button) {
    if (!button) return;
    const state = getAutoScrollDownState();
    const words = buttonWords(state);
    button.classList.toggle("awtsmoos-auto-scroll-on", state.active);
    button.classList.toggle("awtsmoos-auto-scroll-is-paused", state.paused);
    button.setAttribute("aria-pressed", String(state.active));
    button.title = words.title;
    const icon = button.querySelector(".awtsmoos-auto-scroll-icon");
    if (icon) icon.textContent = words.icon;
    const label = button.querySelector(".awtsmoos-auto-scroll-label");
    if (label) label.textContent = words.label;
    const speedLabel = button.querySelector(".awtsmoos-auto-scroll-speed");
    if (speedLabel) speedLabel.textContent = `${state.speed.toFixed(1)}x`;
}

function bindButtonEvents(button) {
    button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        toggleAutoScrollDown({ speed: getAutoScrollDownState().speed });
        updateAutoScrollButton(button);
    });
    window.addEventListener("awtsmoos:auto-scroll-speed", () => updateAutoScrollButton(button));
    window.addEventListener("awtsmoos:auto-scroll-state", () => updateAutoScrollButton(button));
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
    button.innerHTML = `<span class="awtsmoos-auto-scroll-icon">⬇</span><span class="awtsmoos-auto-scroll-label">Scroll</span><span class="awtsmoos-auto-scroll-speed"></span>`;
    bindButtonEvents(button);
    const host = document.querySelector(".post-reader-localized-context") || document.body;
    host.appendChild(button);
    updateAutoScrollButton(button);
    return button;
}
