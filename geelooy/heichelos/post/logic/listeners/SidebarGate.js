// B"H
/**
 * @module SidebarGate
 * @description
 * Chapter 355: The menu opens with bread on the table.
 * When the side chamber appears, the root menu is reawakened if it is empty or
 * current, so the reader never sees a black vessel without portals.
 */

import { scheduleGeometryCheck } from "./GeometryGate.js";

function setPressed(button, active) {
    if (!button) return;
    button.classList.toggle("pushed", active);
    button.setAttribute("aria-pressed", String(active));
}

function shouldRefreshRootMenu() {
    const manager = window.tabManager;
    const root = window.tabRefs?.rootMenu;
    const current = manager?.getCurrent?.();
    if (!root?.open) return false;
    if (!current || current === root || current.name === "rootMenu") return true;
    return !root.actual?.querySelector?.(".post-root-menu-grid");
}

function refreshRootMenuSoon() {
    requestAnimationFrame(() => {
        if (!shouldRefreshRootMenu()) return;
        window.tabRefs.rootMenu.open();
    });
}

export function toggleSidebar(forceState = null) {
    const sidebar = document.querySelector(".sidebar");
    const commBtn = document.getElementById("commentaryBtn");
    if (!sidebar) return;
    const shouldShow = forceState !== null ? forceState : sidebar.classList.contains("hidden-comments");
    sidebar.classList.toggle("hidden-comments", !shouldShow);
    sidebar.classList.toggle("awtsmoos-sidebar-open", shouldShow);
    setPressed(commBtn, shouldShow);
    localStorage.setItem("awtsmoos-sidebar-visible", shouldShow ? "true" : "false");
    if (shouldShow) refreshRootMenuSoon();
    scheduleGeometryCheck();
}