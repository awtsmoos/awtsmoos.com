//B"H
/**
 * @file draggable.js
 * @description
 * Chapter 27: The Sidebar no longer stutters under the hand. The Awtsmoos takes
 * every pointer movement, keeps only the latest spark, and paints one frame at a
 * time. Resize becomes coalesced, geometry waits until idle, and mobile/desktop
 * memory remains stable without forcing layout on every breath.
 */

import { performGeometricCheck } from "../logic/visuals/observer.js";

let lastDesktopWidth = 420;
let lastMobileHeight = 400;

function isMobileViewport() {
    return window.innerWidth <= 900;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

function scheduleFrame(callback) {
    if (typeof requestAnimationFrame === "function") return requestAnimationFrame(callback);
    return setTimeout(callback, 16);
}

function cancelFrame(id) {
    if (!id) return;
    if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(id);
    else clearTimeout(id);
}

function scheduleGeometryRepair() {
    const repair = () => performGeometricCheck();
    if (typeof requestIdleCallback === "function") requestIdleCallback(repair, { timeout: 220 });
    else scheduleFrame(repair);
}

function setSidebarDesktopWidth(sidebar, width) {
    sidebar.style.setProperty("width", `${width}px`, "important");
    sidebar.style.setProperty("flex-basis", `${width}px`, "important");
    sidebar.style.removeProperty("height");
    document.documentElement.style.setProperty("--sidebar-width", `${width}px`);
}

function setSidebarMobileHeight(sidebar, height) {
    sidebar.style.setProperty("height", `${height}px`, "important");
    sidebar.style.removeProperty("width");
    sidebar.style.removeProperty("flex-basis");
}

function applyResize(sidebar, point) {
    if (isMobileViewport()) {
        const height = clamp(window.innerHeight - point.y, 140, window.innerHeight - 64);
        lastMobileHeight = height;
        setSidebarMobileHeight(sidebar, height);
        return;
    }
    const width = clamp(window.innerWidth - point.x, 300, window.innerWidth * 0.72);
    lastDesktopWidth = width;
    setSidebarDesktopWidth(sidebar, width);
}

function setResizeClass(rootContext, sidebar, active) {
    rootContext?.classList.toggle("resizing-active", active);
    sidebar.classList.toggle("is-resizing", active);
}

function releasePointer(target, pointerId) {
    if (pointerId === null || pointerId === undefined) return;
    if (target.hasPointerCapture?.(pointerId)) target.releasePointerCapture(pointerId);
}

/**
 * Makes the sidebar resize with coalesced frame updates.
 * @param {{sidebar: Element, target: Element}} options Resize options.
 */
export function makeResizable({ sidebar, target }) {
    if (!sidebar || !target) return;

    target.style.touchAction = "none";
    target.style.userSelect = "none";
    target.style.pointerEvents = "auto";

    let isResizing = false;
    let pointerId = null;
    let frameId = 0;
    let latestPoint = { x: 0, y: 0 };
    const rootContext = document.querySelector(".post-reader-localized-context");

    const paintLatest = () => {
        frameId = 0;
        if (!isResizing) return;
        applyResize(sidebar, latestPoint);
    };

    const queuePaint = () => {
        if (frameId) return;
        frameId = scheduleFrame(paintLatest);
    };

    target.addEventListener("pointerdown", event => {
        if (event.cancelable) event.preventDefault();
        event.stopPropagation();
        isResizing = true;
        pointerId = event.pointerId;
        latestPoint = { x: event.clientX, y: event.clientY };
        target.setPointerCapture?.(pointerId);
        setResizeClass(rootContext, sidebar, true);
        queuePaint();
    }, { passive: false });

    target.addEventListener("pointermove", event => {
        if (!isResizing || event.pointerId !== pointerId) return;
        if (event.cancelable) event.preventDefault();
        latestPoint = { x: event.clientX, y: event.clientY };
        queuePaint();
    }, { passive: false });

    const stop = event => {
        if (!isResizing) return;
        isResizing = false;
        cancelFrame(frameId);
        frameId = 0;
        if (event?.clientX !== undefined) latestPoint = { x: event.clientX, y: event.clientY };
        applyResize(sidebar, latestPoint);
        setResizeClass(rootContext, sidebar, false);
        releasePointer(target, pointerId);
        pointerId = null;
        scheduleGeometryRepair();
    };

    target.addEventListener("pointerup", stop, { passive: true });
    target.addEventListener("pointercancel", stop, { passive: true });
}

/**
 * Synchronizes layout only when crossing mobile/desktop boundary.
 * @param {Element} sidebar Sidebar element.
 */
export function setupLayoutSyncer(sidebar) {
    if (!sidebar) return;
    let wasMobile = isMobileViewport();
    let resizeFrame = 0;

    const sync = () => {
        resizeFrame = 0;
        const isMobile = isMobileViewport();
        if (isMobile === wasMobile) return;
        sidebar.style.removeProperty("width");
        sidebar.style.removeProperty("height");
        sidebar.style.removeProperty("flex-basis");
        if (isMobile) setSidebarMobileHeight(sidebar, lastMobileHeight);
        else setSidebarDesktopWidth(sidebar, lastDesktopWidth);
        wasMobile = isMobile;
        scheduleGeometryRepair();
    };

    const scheduleSync = () => {
        if (resizeFrame) return;
        resizeFrame = scheduleFrame(sync);
    };

    window.addEventListener("resize", scheduleSync, { passive: true });
    scheduleSync();
}
