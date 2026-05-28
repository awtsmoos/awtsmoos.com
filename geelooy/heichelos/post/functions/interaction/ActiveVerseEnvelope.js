/**
 * B"H
 * @module ActiveVerseEnvelope
 * @description
 * Chapter 17: When the inner Egypt-subsection glows, the outer verse must glow
 * with it. The Awtsmoos does not let a child chamber become visible while its
 * palace frame stays asleep. This is the fail-safe envelope around every active
 * paragraph.
 */

const OUTER_MARK = "awtsmoos-outer-active-failsafe";
const ACTIVE_CLASSES = ["active", "active-reading-section", OUTER_MARK];
const INNER_ACTIVE_SELECTOR = ".sub-awtsmoos.active, .sub-awtsmoos.active-reading-section";

function frame(callback) {
    if (typeof requestAnimationFrame === "function") return requestAnimationFrame(callback);
    return setTimeout(callback, 16);
}

function cancelFrame(id) {
    if (!id) return;
    if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(id);
    else clearTimeout(id);
}

function getSectionOf(node) {
    return node?.closest?.(".section") || null;
}

function clearStaleFailsafe(root, activeOuter) {
    if (!root?.querySelectorAll) return;
    root.querySelectorAll(`.section.${OUTER_MARK}`).forEach(section => {
        if (section === activeOuter) return;
        section.classList.remove(OUTER_MARK);
        section.classList.remove("active-reading-section");
    });
}

/**
 * Activates the outer verse frame for a highlighted subsection.
 * @param {Element} inner Highlighted subsection or descendant.
 * @param {ParentNode} [root=document] DOM scope.
 * @returns {Element|null} Activated outer section.
 */
export function activateOuterVerseForInner(inner, root = document) {
    const sub = inner?.closest?.(".sub-awtsmoos") || inner;
    const section = getSectionOf(sub);
    if (!section) return null;
    ACTIVE_CLASSES.forEach(className => section.classList.add(className));
    clearStaleFailsafe(root, section);
    return section;
}

/**
 * Finds active inner subsections and guarantees their outer section is active.
 * @param {ParentNode} [root=document] DOM scope.
 * @returns {Element|null} Activated outer section.
 */
export function syncOuterVerseFromActiveInner(root = document) {
    const activeInner = root?.querySelector?.(INNER_ACTIVE_SELECTOR);
    return activeInner ? activateOuterVerseForInner(activeInner, root) : null;
}

/**
 * Installs a low-cost scroll/callback fail-safe that repairs the outer frame.
 * @param {string} containerSelector Scroll container selector.
 * @returns {Function} Cleanup function.
 */
export function installOuterVerseFailsafe(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return () => {};
    let raf = 0;
    const repair = () => {
        raf = 0;
        syncOuterVerseFromActiveInner(container);
    };
    const schedule = () => {
        if (raf) return;
        raf = frame(repair);
    };
    container.addEventListener("scroll", schedule, { passive: true });
    schedule();
    return () => {
        container.removeEventListener("scroll", schedule);
        cancelFrame(raf);
    };
}
