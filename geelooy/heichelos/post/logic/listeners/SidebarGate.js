// B"H
/**
 * @module SidebarGate
 * @description
 * Chapter 4: The side chamber opens only by one covenant. This module owns the
 * visible/hidden state so mobile drawers and desktop panels stop arguing.
 */

import { scheduleGeometryCheck } from "./GeometryGate.js";

function setPressed(button, active) {
    if (!button) return;
    button.classList.toggle("pushed", active);
    button.setAttribute("aria-pressed", String(active));
}

/**
 * Commands the Sidebar to emerge or retreat instantly.
 * @param {boolean|null} forceState If true, ensures sidebar is visible.
 */
export function toggleSidebar(forceState = null) {
    const sidebar = document.querySelector(".sidebar");
    const commBtn = document.getElementById("commentaryBtn");
    if (!sidebar) return;
    const shouldShow = forceState !== null ? forceState : sidebar.classList.contains("hidden-comments");
    sidebar.classList.toggle("hidden-comments", !shouldShow);
    sidebar.classList.toggle("awtsmoos-sidebar-open", shouldShow);
    setPressed(commBtn, shouldShow);
    localStorage.setItem("awtsmoos-sidebar-visible", shouldShow ? "true" : "false");
    scheduleGeometryCheck();
}
