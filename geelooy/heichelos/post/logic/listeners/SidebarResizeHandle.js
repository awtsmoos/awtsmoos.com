// B"H
/**
 * @module SidebarResizeHandle
 * @description
 * Chapter 194: The chamber wall becomes clay beneath the reader's hand.
 * On desktop the left edge of the commentary palace stretches east and west.
 * On mobile the upper lip stretches heavenward and earthward. The Awtsmoos
 * stores each measurement, restores it, and never lets a button-click become a
 * resize gesture by accident.
 */

const DESKTOP_WIDTH_KEY = "awtsmoos-sidebar-desktop-width";
const MOBILE_HEIGHT_KEY = "awtsmoos-sidebar-mobile-height";
const DESKTOP_MIN = 320;
const DESKTOP_MAX_RATIO = 0.72;
const MOBILE_MIN = 220;
const MOBILE_TOP_GAP = 72;

let cleanupResize = null;

function isMobile() { return window.innerWidth <= 900; }
function clamp(value, min, max) { return Math.max(min, Math.min(value, max)); }
function numberFromStorage(key, fallback) {
    const value = Number.parseFloat(localStorage.getItem(key) || "");
    return Number.isFinite(value) ? value : fallback;
}
function store(key, value) { try { localStorage.setItem(key, String(Math.round(value))); } catch {} }

function desktopBounds() {
    return { min: DESKTOP_MIN, max: Math.max(DESKTOP_MIN, window.innerWidth * DESKTOP_MAX_RATIO) };
}

function mobileBounds() {
    return { min: MOBILE_MIN, max: Math.max(MOBILE_MIN, window.innerHeight - MOBILE_TOP_GAP) };
}

function applyDesktopWidth(sidebar, width) {
    const bounds = desktopBounds();
    const finalWidth = clamp(width, bounds.min, bounds.max);
    sidebar.style.setProperty("width", `${finalWidth}px`, "important");
    sidebar.style.setProperty("max-width", `${finalWidth}px`, "important");
    sidebar.style.removeProperty("height");
    document.documentElement.style.setProperty("--awtsmoos-sidebar-width", `${finalWidth}px`);
    store(DESKTOP_WIDTH_KEY, finalWidth);
}

function applyMobileHeight(sidebar, height) {
    const bounds = mobileBounds();
    const finalHeight = clamp(height, bounds.min, bounds.max);
    sidebar.style.setProperty("height", `${finalHeight}px`, "important");
    sidebar.style.setProperty("max-height", `${finalHeight}px`, "important");
    sidebar.style.removeProperty("width");
    sidebar.style.removeProperty("max-width");
    document.documentElement.style.setProperty("--awtsmoos-sidebar-height", `${finalHeight}px`);
    store(MOBILE_HEIGHT_KEY, finalHeight);
}

function restoreSize(sidebar) {
    if (isMobile()) applyMobileHeight(sidebar, numberFromStorage(MOBILE_HEIGHT_KEY, Math.round(window.innerHeight * 0.74)));
    else applyDesktopWidth(sidebar, numberFromStorage(DESKTOP_WIDTH_KEY, 440));
}

function makeHandle(sidebar) {
    let handle = sidebar.querySelector(":scope > .awtsmoos-sidebar-resizer");
    if (handle) return handle;
    handle = document.createElement("div");
    handle.className = "awtsmoos-sidebar-resizer";
    handle.setAttribute("role", "separator");
    handle.setAttribute("aria-label", "Resize comments panel");
    handle.setAttribute("aria-orientation", isMobile() ? "horizontal" : "vertical");
    handle.tabIndex = 0;
    sidebar.prepend(handle);
    return handle;
}

function pointOf(event) {
    return { x: Number(event.clientX || 0), y: Number(event.clientY || 0) };
}

function resizeFromPoint(sidebar, point) {
    if (isMobile()) applyMobileHeight(sidebar, window.innerHeight - point.y);
    else applyDesktopWidth(sidebar, window.innerWidth - point.x);
}

function resizeFromKeyboard(sidebar, event) {
    const step = event.shiftKey ? 48 : 18;
    if (isMobile()) {
        const current = sidebar.getBoundingClientRect().height;
        if (event.key === "ArrowUp") applyMobileHeight(sidebar, current + step);
        else if (event.key === "ArrowDown") applyMobileHeight(sidebar, current - step);
        else return;
    } else {
        const current = sidebar.getBoundingClientRect().width;
        if (event.key === "ArrowLeft") applyDesktopWidth(sidebar, current + step);
        else if (event.key === "ArrowRight") applyDesktopWidth(sidebar, current - step);
        else return;
    }
    event.preventDefault();
}

function setResizing(root, sidebar, active) {
    root?.classList.toggle("awtsmoos-sidebar-resizing", active);
    sidebar.classList.toggle("is-resizing", active);
}

function bindDrag(sidebar, handle) {
    const root = document.querySelector(".post-reader-localized-context");
    let activePointer = null;
    let raf = 0;
    let latest = { x: 0, y: 0 };

    const paint = () => {
        raf = 0;
        if (activePointer === null) return;
        resizeFromPoint(sidebar, latest);
    };
    const schedule = () => {
        if (!raf) raf = requestAnimationFrame(paint);
    };
    const move = event => {
        if (activePointer !== event.pointerId) return;
        latest = pointOf(event);
        schedule();
    };
    const stop = event => {
        if (activePointer !== event.pointerId) return;
        latest = pointOf(event);
        resizeFromPoint(sidebar, latest);
        activePointer = null;
        setResizing(root, sidebar, false);
        handle.releasePointerCapture?.(event.pointerId);
        document.removeEventListener("pointermove", move, true);
        document.removeEventListener("pointerup", stop, true);
        document.removeEventListener("pointercancel", stop, true);
    };

    handle.addEventListener("pointerdown", event => {
        if (event.cancelable) event.preventDefault();
        event.stopPropagation();
        activePointer = event.pointerId;
        latest = pointOf(event);
        handle.setPointerCapture?.(event.pointerId);
        setResizing(root, sidebar, true);
        document.addEventListener("pointermove", move, true);
        document.addEventListener("pointerup", stop, true);
        document.addEventListener("pointercancel", stop, true);
        schedule();
    }, { passive: false });

    handle.addEventListener("keydown", event => resizeFromKeyboard(sidebar, event));

    return () => {
        if (activePointer !== null) setResizing(root, sidebar, false);
        document.removeEventListener("pointermove", move, true);
        document.removeEventListener("pointerup", stop, true);
        document.removeEventListener("pointercancel", stop, true);
    };
}

/** Installs or refreshes sidebar resizing behavior. */
export function setupSidebarResizeHandle() {
    cleanupResize?.();
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;
    const handle = makeHandle(sidebar);
    restoreSize(sidebar);
    cleanupResize = bindDrag(sidebar, handle);
    window.addEventListener("resize", () => restoreSize(sidebar), { passive: true });
}
