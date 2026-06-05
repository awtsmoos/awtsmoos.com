// B"H
/**
 * @module SubsectionVirtualizer
 * @description
 * The inner verse is no longer virtualized.
 *
 * Chapter 246: The reader must never feel the gears.
 * A single verse may contain many baby subsections. Earlier versions tried to
 * stream those baby chambers one by one, but that made ownership flicker near
 * boundaries and made auto-scroll feel like a visible machine. The correct law
 * is simpler and truer: when a verse appears, every subsection of that verse is
 * physically present. Only verses themselves are streamed.
 *
 * This preserves real scroll physics. No fake height. No hidden subsection
 * gaps. No deleting read content. No subsection handoff battles. The Awtsmoos
 * creates the whole inner palace at once, then the outer river may bring the
 * next palace when the reader nears its gate.
 */

import { sanitizeContent, appendHTML, isFirstCharacterHebrew } from "/heichelos/post/postFunctions.js";

const REGISTRY = new Map();
let pendingInline = 0;
let debugNode = null;

const asNum = (value, fallback = 0) => {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) ? n : fallback;
};

const debugOn = () => new URLSearchParams(location.search).get("vdebug") === "1";

function scheduleInlineRefresh() {
    clearTimeout(pendingInline);
    pendingInline = setTimeout(async () => {
        try {
            const { manifestAllActiveInlines } = await import("../../comments/inline.js");
            await manifestAllActiveInlines();
        } catch (error) {
            if (window.__awtsmoosInlineDebug) console.warn("B\"H inline remanifest resisted", error);
        }
    }, 90);
}

function makeAwake(entry, sectionIndex) {
    const el = document.createElement("div");
    el.className = `sub-awtsmoos ${isFirstCharacterHebrew(entry.text) ? "heb" : "en"}`;
    el.dataset.awtsmoosIdx = String(sectionIndex);
    el.dataset.awtsmoosSub = String(entry.index);
    el.dataset.awtsmoosSubstate = "awake";
    appendHTML(sanitizeContent(entry.text), el);
    if (window.registerObservable) window.registerObservable(el);
    return el;
}

function renderAll(state) {
    const fragment = document.createDocumentFragment();
    state.entries.forEach(entry => fragment.appendChild(makeAwake(entry, state.sectionIndex)));
    state.wrapper.replaceChildren(fragment);
    state.first = 0;
    state.last = Math.max(0, state.entries.length - 1);
    state.wrapper.dataset.virtualWindow = `0-${state.last}`;
    state.wrapper.dataset.virtualAwakeCount = String(state.entries.length);
    updateDebugPanel();
    scheduleInlineRefresh();
}

function stateFor(sectionIndex) {
    if (sectionIndex === null || sectionIndex === undefined || sectionIndex === "") return null;
    return REGISTRY.get(String(sectionIndex)) || null;
}

function gateFromState(state) {
    if (!state) return { hasState: false, canNext: false, canPrev: false };
    return {
        hasState: true,
        sectionIndex: state.sectionIndex,
        first: state.first,
        last: state.last,
        total: state.entries.length,
        canNext: false,
        canPrev: false
    };
}

function updateDebugPanel() {
    if (!debugOn()) return;
    if (!debugNode) {
        debugNode = document.createElement("div");
        debugNode.id = "awtsmoosVirtualDebugPanel";
        debugNode.style.cssText = "position:fixed;left:12px;bottom:95px;z-index:999999;background:#06101f;color:#ffe08a;border:1px solid #7b5cff;border-radius:14px;padding:10px 12px;font:700 13px system-ui;box-shadow:0 12px 34px #000a;max-width:360px;pointer-events:none";
        document.body.appendChild(debugNode);
    }
    const stat = [...REGISTRY.values()].map(s => `${s.sectionIndex}:all/${s.entries.length}`).join(" · ");
    const awake = document.querySelectorAll("#realPost .sub-awtsmoos[data-awtsmoos-substate='awake']").length;
    debugNode.textContent = `B\"H verse-level stream; awake subs ${awake}; ${stat}`;
}

/**
 * Creates a real-height subsection body. Every subsection is present.
 * @param {Array<string>} texts Subsection HTML/text payloads.
 * @param {number|string} sectionIndex Verse index.
 * @param {number|string|null} targetSub Optional target subsection coordinate.
 * @returns {HTMLElement} The complete verse body wrapper.
 */
export function makeVirtualSubsectionWindow(texts, sectionIndex, targetSub = null) {
    const wrapper = document.createElement("div");
    wrapper.className = "awtsmoos-subsection-wrap awtsmoos-subsection-window toichen";
    wrapper.dataset.awtsmoosIdx = String(sectionIndex);
    wrapper.dataset.virtualSubsections = "all-subsections-real-height";

    const entries = texts.map((text, index) => ({ index, text })).filter(entry => String(entry.text || "").trim());
    const state = {
        wrapper,
        sectionIndex,
        entries,
        first: 0,
        last: Math.max(0, entries.length - 1),
        target: targetSub === null || targetSub === undefined ? 0 : asNum(targetSub, 0)
    };
    REGISTRY.set(String(sectionIndex), state);
    renderAll(state);
    return wrapper;
}

/**
 * Reveals an exact subsection coordinate. Since all subsections are already in
 * DOM, this only returns the target node.
 */
export function awakenSubsectionByCoordinate(idx, sub) {
    if (sub === null || sub === undefined || sub === "") return null;
    const state = stateFor(idx);
    if (!state) return null;
    const target = asNum(sub, 0);
    return state.wrapper.querySelector(`.sub-awtsmoos[data-awtsmoos-sub="${target}"]`);
}

/** Verse-level streaming no longer consumes subsection scroll events. */
export function ensureSubsectionBuffer() { return false; }
export function ensureSubsectionBufferFor() { return false; }
export function consumeSubsectionScrollIntent() { return false; }
export function consumeSubsectionScrollIntentFor() { return false; }
export function currentSubsectionGateState(sectionIndex = null) { return gateFromState(stateFor(sectionIndex)); }

/** Legacy compatibility only. Never delete registry/content during reading. */
export function forgetSubsectionWindowsInside() {
    updateDebugPanel();
    return false;
}

window.__awtsmoosRevealSubsection = awakenSubsectionByCoordinate;
window.__awtsmoosConsumeSubsectionScrollIntent = consumeSubsectionScrollIntent;
window.__awtsmoosEnsureSubsectionBuffer = ensureSubsectionBuffer;
window.__awtsmoosEnsureSubsectionBufferFor = ensureSubsectionBufferFor;
window.__awtsmoosSubsectionGateState = currentSubsectionGateState;
window.__awtsmoosSubsectionVirtualStats = () => [...REGISTRY.values()].map(state => ({
    sectionIndex: state.sectionIndex,
    total: state.entries.length,
    first: state.first,
    last: state.last,
    awake: state.entries.length,
    mode: "all-subsections-real-height"
}));
