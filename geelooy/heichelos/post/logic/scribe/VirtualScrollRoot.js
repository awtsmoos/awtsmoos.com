// B"H
/**
 * @module VirtualScrollRoot
 * @description
 * Chapter 287: The reader must follow the river that can actually move.
 *
 * A fixed post shell can make the document report giant height while the living
 * scroll happens inside `.scroll-view-wrapper`. This resolver gives reader
 * vessels priority over document roots, verifies that the candidate can move,
 * and exposes a tiny read/write API to the virtualization oracle.
 */

function docRoot() {
    return document.scrollingElement || document.documentElement || document.body;
}

function asNode(value) {
    return value && typeof value === "object" ? value : null;
}

function number(value) {
    return Number(value || 0);
}

function canActuallyScroll(node) {
    if (!node) return false;
    return number(node.scrollHeight) > number(node.clientHeight) + 2;
}

function styleAllowsScroll(node) {
    if (!node || node === window) return true;
    if (typeof getComputedStyle !== "function") return true;
    const style = getComputedStyle(node);
    const y = `${style.overflowY || ""} ${style.overflow || ""}`;
    return /(auto|scroll|overlay)/.test(y) || node === docRoot() || node === document.body || node === document.documentElement;
}

function hasFixedReaderShell() {
    const shell = document.querySelector?.(".post-reader-localized-context");
    if (!shell) return false;
    if (typeof getComputedStyle !== "function") return true;
    return getComputedStyle(shell).position === "fixed";
}

function candidateRows() {
    const internal = [
        document.querySelector?.(".scroll-view-wrapper"),
        document.querySelector?.(".post-reader-localized-context .main"),
        document.querySelector?.("#realPost"),
        document.querySelector?.(".post-reader-localized-context")
    ].map(asNode).filter(Boolean).map((node, index) => ({ node, priority: 1000 - index }));
    const documentCandidates = [docRoot(), document.body, document.documentElement]
        .map(asNode).filter(Boolean).map((node, index) => ({ node, priority: 10 - index }));
    return hasFixedReaderShell() ? [...internal, ...documentCandidates] : [...internal, ...documentCandidates];
}

function movableHeight(node) {
    if (!canActuallyScroll(node) || !styleAllowsScroll(node)) return -1;
    const original = number(node.scrollTop);
    const max = Math.max(0, number(node.scrollHeight) - number(node.clientHeight));
    if (max <= 2) return -1;
    try {
        node.scrollTop = Math.min(max, original + 11);
        const moved = Math.abs(number(node.scrollTop) - original) > 0.5;
        node.scrollTop = original;
        return moved ? max : -1;
    } catch (_) {
        return max;
    }
}

export function scrollRoot() {
    let winner = null;
    let best = -1;
    for (const row of candidateRows()) {
        const height = movableHeight(row.node);
        if (height < 0) continue;
        const score = row.priority * 1000000 + height;
        if (score > best) {
            best = score;
            winner = row.node;
        }
    }
    return winner || docRoot();
}

export function isDocumentRoot(root = scrollRoot()) {
    return root === docRoot() || root === document.body || root === document.documentElement;
}

export function scrollTopOf(root = scrollRoot()) {
    return isDocumentRoot(root) ? number(window.scrollY || root.scrollTop) : number(root.scrollTop);
}

export function viewportHeightOf(root = scrollRoot()) {
    return isDocumentRoot(root) ? number(window.innerHeight || root.clientHeight) : number(root.clientHeight);
}

export function scrollHeightOf(root = scrollRoot()) {
    const bodyHeight = Math.max(number(document.body?.scrollHeight), number(document.documentElement?.scrollHeight));
    return isDocumentRoot(root) ? bodyHeight : number(root.scrollHeight);
}

export function bottomDistanceOf(root = scrollRoot()) {
    return Math.max(0, scrollHeightOf(root) - (scrollTopOf(root) + viewportHeightOf(root)));
}

export function setScrollTop(root, top) {
    const safe = Math.max(0, number(top));
    if (isDocumentRoot(root)) window.scrollTo({ top: safe, behavior: "auto" });
    else root.scrollTop = safe;
}

export function addRootScrollListener(handler) {
    const root = scrollRoot();
    const targets = new Set([window, root]);
    const options = { passive: true };
    for (const target of targets) target?.addEventListener?.("scroll", handler, options);
    window.addEventListener("wheel", handler, options);
    window.addEventListener("touchmove", handler, options);
    window.addEventListener("keydown", handler, false);
    return () => {
        for (const target of targets) target?.removeEventListener?.("scroll", handler, options);
        window.removeEventListener("wheel", handler, options);
        window.removeEventListener("touchmove", handler, options);
        window.removeEventListener("keydown", handler, false);
    };
}

export function rootDiagnostics() {
    const root = scrollRoot();
    return {
        isDocument: isDocumentRoot(root),
        tag: root?.tagName || "window",
        id: root?.id || "",
        className: String(root?.className || ""),
        scrollTop: scrollTopOf(root),
        scrollHeight: scrollHeightOf(root),
        clientHeight: viewportHeightOf(root),
        bottomDistance: bottomDistanceOf(root),
        fixedReaderShell: hasFixedReaderShell()
    };
}
