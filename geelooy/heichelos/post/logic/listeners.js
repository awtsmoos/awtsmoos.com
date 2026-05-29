//B"H
/**
 * @file listeners.js
 * @description
 * Chapter 21: The gates become lightning. The sidebar opens by class change,
 * geometry repair waits for the browser's spare breath, and auto-scroll lives
 * outside the sidebar as its own floating river-button.
 */

import { updateQueryStringParameter, adjustFontSize } from "../functions/utils.js";
import { performGeometricCheck } from "./visuals/observer.js";
import { getAutoScrollDownState, toggleAutoScrollDown } from "../actions/AutoScrollDown.js";

let geometryRaf = 0;

function scheduleGeometryCheck() {
    if (geometryRaf) return;
    const run = () => {
        geometryRaf = 0;
        if (typeof requestIdleCallback === "function") requestIdleCallback(() => performGeometricCheck(), { timeout: 180 });
        else performGeometricCheck();
    };
    if (typeof requestAnimationFrame === "function") geometryRaf = requestAnimationFrame(run);
    else setTimeout(run, 0);
}

function setPressed(button, active) {
    if (!button) return;
    button.classList.toggle("pushed", active);
    button.setAttribute("aria-pressed", String(active));
}

function updateAutoScrollButton(button, active) {
    if (!button) return;
    button.classList.toggle("awtsmoos-auto-scroll-on", active);
    button.setAttribute("aria-pressed", String(active));
    button.title = active ? "Stop auto scroll" : "Auto scroll down";
    button.querySelector(".awtsmoos-auto-scroll-label").textContent = active ? "Stop" : "Scroll";
}

function ensureAutoScrollButton() {
    let button = document.getElementById("awtsmoosAutoScrollBtn");
    if (button) return button;
    button = document.createElement("button");
    button.id = "awtsmoosAutoScrollBtn";
    button.type = "button";
    button.className = "awtsmoos-auto-scroll-floating";
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

function setupFontControls() {
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

function setupGlobalClicks() {
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
            const panel = document.getElementById("typographyDetails");
            if (panel) {
                const shouldOpen = panel.classList.contains("hidden-details");
                panel.classList.toggle("hidden-details", !shouldOpen);
                typeBtn.classList.toggle("pushed", shouldOpen);
            }
            return;
        }
        dismissPopovers(event);
    }, { passive: false });
}

function setupColorControls() {
    document.querySelectorAll('.color-control input[type="color"]').forEach(input => {
        input.addEventListener("input", event => {
            const cssVar = event.target.dataset.cssVar;
            document.querySelector(".post-reader-localized-context")?.style.setProperty(cssVar, event.target.value);
        });
    });
}

function setupResetButton() {
    const resetBtn = document.getElementById("resetDefaultsBtn");
    if (!resetBtn) return;
    resetBtn.addEventListener("click", () => {
        if (!confirm("B\"H - Restore factory appearance settings? This will clear your custom alchemy.")) return;
        [
            "awtsmoos-theme",
            "awtsmoos-font",
            "currentPostFontSize",
            "awtsmoos-custom-themes",
            "awtsmoos-sidebar-visible",
            "awtsmoos-active-tab"
        ].forEach(key => localStorage.removeItem(key));
        window.location.reload();
    });
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

/**
 * Manifests the saved bookmarks in the sidebar.
 * @param {Element} tab Sidebar tab body.
 */
export async function renderBookmarksPanel(tab) {
    if (!tab) return;
    tab.innerHTML = "";
    const bookmarks = JSON.parse(localStorage.getItem("awtsmoos-bookmarks") || "[]");
    if (bookmarks.length === 0) {
        tab.innerHTML = `<div style="padding:20px;text-align:center;color:var(--color-ink-secondary);font-weight:800;text-transform:uppercase;">No bookmarks saved yet.<br>Click 'B' next to any verse.</div>`;
        return;
    }
    const list = document.createElement("ul");
    list.className = "bookmarks-list";
    bookmarks.forEach((bm, index) => {
        const li = document.createElement("li");
        li.style.cssText = "padding:15px;border-bottom:1px solid var(--color-ink);cursor:pointer;position:relative;background:var(--bg-surface);";
        li.innerHTML = `<div style="font-weight:900;text-transform:uppercase;font-size:11px;margin-bottom:5px;">${bm.title}</div><div style="font-size:13px;opacity:.8;line-height:1.3;">${bm.textPreview}</div>`;
        const del = document.createElement("button");
        del.innerHTML = "×";
        del.className = "bookmark-delete-btn";
        del.onclick = event => {
            event.stopPropagation();
            bookmarks.splice(index, 1);
            localStorage.setItem("awtsmoos-bookmarks", JSON.stringify(bookmarks));
            renderBookmarksPanel(tab);
        };
        li.appendChild(del);
        li.onclick = () => {
            updateQueryStringParameter("idx", bm.idx);
            updateQueryStringParameter("sub", bm.sub || null);
            window.location.reload();
        };
        list.appendChild(li);
    });
    tab.appendChild(list);
}

/**
 * Binds the central event loop to the user's intent.
 */
export function setupUIListeners() {
    const sidebarStoredState = localStorage.getItem("awtsmoos-sidebar-visible");
    toggleSidebar(sidebarStoredState === "true");
    ensureAutoScrollButton();
    setupFontControls();
    setupGlobalClicks();
    setupColorControls();
    setupResetButton();
}

window.toggleSidebar = toggleSidebar;
