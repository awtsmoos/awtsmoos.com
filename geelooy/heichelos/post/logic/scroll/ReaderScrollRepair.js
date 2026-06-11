// B"H
/**
 * @module ReaderScrollRepair
 * @description
 * Chapter 301: The reader is placed back into ordinary page flow.
 * The earlier fixed-shell repair made the CSS harsh and caused wheel motion to
 * behave differently over the verses. This repair now clears that harshness,
 * keeps the document scrollable, and leaves the reader's own content untouched.
 */

const ROOT_SELECTOR = ".post-reader-localized-context";
const WRAPPER_SELECTOR = ".scroll-view-wrapper";

function important(node, pairs) {
    if (!node) return;
    for (const [name, value] of pairs) node.style.setProperty(name, value, "important");
}

function repairDocument() {
    [document.documentElement, document.body].forEach(node => {
        if (!node) return;
        node.classList.add("awtsmoos-reader-scroll-repaired");
        important(node, [
            ["width", "100%"],
            ["min-height", "100%"],
            ["height", "auto"],
            ["overflow-x", "hidden"],
            ["overflow-y", "auto"],
            ["overscroll-behavior-y", "auto"],
            ["position", "static"],
            ["touch-action", "pan-y"]
        ]);
    });
}

function repairRoot(root) {
    root.classList.add("awtsmoos-reader-vision");
    important(root, [
        ["position", "relative"],
        ["inset", "auto"],
        ["width", "100%"],
        ["min-height", "100dvh"],
        ["height", "auto"],
        ["max-height", "none"],
        ["display", "block"],
        ["overflow-x", "clip"],
        ["overflow-y", "visible"],
        ["isolation", "isolate"],
        ["touch-action", "pan-y"]
    ]);
}

function repairMain(root) {
    important(root?.querySelector(":scope > .main"), [
        ["position", "static"],
        ["display", "block"],
        ["min-height", "calc(100dvh - var(--awt-header-space, 0px))"],
        ["height", "auto"],
        ["max-height", "none"],
        ["overflow-x", "clip"],
        ["overflow-y", "visible"],
        ["touch-action", "pan-y"]
    ]);
}

function repairWrapper(root) {
    important(root?.querySelector(WRAPPER_SELECTOR), [
        ["position", "relative"],
        ["width", "100%"],
        ["min-height", "calc(100dvh - var(--awt-header-space, 0px))"],
        ["height", "auto"],
        ["max-height", "none"],
        ["overflow-x", "clip"],
        ["overflow-y", "visible"],
        ["overscroll-behavior-y", "auto"],
        ["-webkit-overflow-scrolling", "touch"],
        ["scroll-behavior", "auto"],
        ["touch-action", "pan-y"]
    ]);
}

function repairContent() {
    ["realPost", "virtual-scroll-container"].forEach(id => important(document.getElementById(id), [
        ["height", "auto"],
        ["max-height", "none"],
        ["min-height", "0"],
        ["overflow", "visible"],
        ["touch-action", "pan-y"]
    ]));
}

export function repairReaderScrollVessel() {
    repairDocument();
    const root = document.querySelector(ROOT_SELECTOR);
    if (!root) return null;
    repairRoot(root);
    repairMain(root);
    repairWrapper(root);
    repairContent();
    const wrapper = root.querySelector(WRAPPER_SELECTOR);
    window.__awtsmoosReaderScrollRepair = {
        mode: "natural-document-river",
        at: Date.now(),
        documentCanScroll: document.documentElement.scrollHeight > window.innerHeight + 2,
        wrapperCanScroll: !!wrapper && wrapper.scrollHeight > wrapper.clientHeight + 2
    };
    return wrapper;
}
