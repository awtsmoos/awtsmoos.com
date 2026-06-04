// B"H
/**
 * @module SubsectionVirtualizer
 * @description
 * The Awtsmoos whispers: finish the verse before birthing the next verse.
 *
 * This engine streams only a few baby subsections from the current verse. It is
 * not tied to the document scrollbar edge. It watches the visible subsection
 * window itself, so scrolling down feels ordinary: the next chamber appears
 * before the reader collides with emptiness. Scrolling up is guarded by one
 * exact compensation, preserving the eye's place while older chambers awaken.
 */

import { sanitizeContent, appendHTML, isFirstCharacterHebrew } from "/heichelos/post/postFunctions.js";

const AHEAD_PX = 900;
const ACTIVE_PAD_PX = 1200;
const PRUNE_PX = 2200;
const MIN_DELTA = 3;
const MIN_AWAKE = 2;
const MAX_AWAKE = 5;
const REGISTRY = new Map();
let pendingInline = 0;
let debugNode = null;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const asNum = (value, fallback = 0) => {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) ? n : fallback;
};
const debugOn = () => new URLSearchParams(location.search).get("vdebug") === "1";

function readerFontPx() {
    const css = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--awtsmoos-reader-font-size"));
    if (Number.isFinite(css)) return css;
    const sample = document.querySelector(".toichen, .section, #realPost");
    const found = sample ? Number.parseFloat(getComputedStyle(sample).fontSize) : NaN;
    return Number.isFinite(found) ? found : 42;
}

function desiredCount(total) {
    const font = clamp(readerFontPx(), 18, 180);
    const room = Math.max(360, window.innerHeight || 720);
    return Math.min(total, clamp(Math.floor(room / (font * 3.4)) + 1, MIN_AWAKE, MAX_AWAKE));
}

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

function stamp(state) {
    state.wrapper.dataset.virtualWindow = `${state.first}-${state.last}`;
    state.wrapper.dataset.virtualAwakeCount = String(state.last - state.first + 1);
    updateDebugPanel();
    scheduleInlineRefresh();
}

function rebuild(state) {
    const frag = document.createDocumentFragment();
    for (let i = state.first; i <= state.last; i++) frag.appendChild(makeAwake(state.entries[i], state.sectionIndex));
    state.wrapper.replaceChildren(frag);
    stamp(state);
}

function setWindow(state, first) {
    const count = desiredCount(state.entries.length);
    const maxFirst = Math.max(0, state.entries.length - count);
    state.first = clamp(first, 0, maxFirst);
    state.last = Math.min(state.entries.length - 1, state.first + count - 1);
    rebuild(state);
}

function appendNext(state) {
    if (state.last >= state.entries.length - 1) return false;
    state.last += 1;
    state.wrapper.appendChild(makeAwake(state.entries[state.last], state.sectionIndex));
    trimFarTop(state);
    stamp(state);
    return true;
}

function prependPrevious(state) {
    if (state.first <= 0) return false;
    state.first -= 1;
    const node = makeAwake(state.entries[state.first], state.sectionIndex);
    state.wrapper.insertBefore(node, state.wrapper.firstChild);
    const height = node.getBoundingClientRect().height || 0;
    if (height) window.scrollBy(0, height);
    trimFarBottom(state);
    stamp(state);
    return true;
}

function trimFarTop(state) {
    while (state.wrapper.children.length > desiredCount(state.entries.length)) {
        const firstNode = state.wrapper.firstElementChild;
        if (!firstNode) break;
        const rect = firstNode.getBoundingClientRect();
        if (rect.bottom > -PRUNE_PX) break;
        const height = rect.height || 0;
        firstNode.remove();
        state.first += 1;
        if (height) window.scrollBy(0, -height);
    }
}

function trimFarBottom(state) {
    while (state.wrapper.children.length > desiredCount(state.entries.length)) {
        const lastNode = state.wrapper.lastElementChild;
        if (!lastNode) break;
        const rect = lastNode.getBoundingClientRect();
        if (rect.top < window.innerHeight + PRUNE_PX) break;
        lastNode.remove();
        state.last -= 1;
    }
}

function activeState() {
    let best = null;
    let bestDistance = Infinity;
    const probe = Math.min(window.innerHeight * 0.48, window.innerHeight - 120);
    REGISTRY.forEach(state => {
        const rect = state.wrapper.getBoundingClientRect();
        if (rect.bottom < -ACTIVE_PAD_PX || rect.top > window.innerHeight + ACTIVE_PAD_PX) return;
        const distance = rect.top <= probe && rect.bottom >= probe ? 0 : Math.min(Math.abs(rect.top - probe), Math.abs(rect.bottom - probe));
        if (distance < bestDistance) { best = state; bestDistance = distance; }
    });
    return best;
}

function shouldAwakenNext(state) {
    if (state.last >= state.entries.length - 1) return false;
    const last = state.wrapper.lastElementChild?.getBoundingClientRect();
    const wrap = state.wrapper.getBoundingClientRect();
    return Boolean(last && (last.bottom < window.innerHeight + AHEAD_PX || wrap.bottom < window.innerHeight + AHEAD_PX));
}

function shouldAwakenPrevious(state) {
    if (state.first <= 0) return false;
    const first = state.wrapper.firstElementChild?.getBoundingClientRect();
    const wrap = state.wrapper.getBoundingClientRect();
    return Boolean(first && (first.top > -AHEAD_PX || wrap.top > -AHEAD_PX));
}

export function consumeSubsectionScrollIntent(delta) {
    if (Math.abs(delta) < MIN_DELTA) return false;
    const state = activeState();
    if (!state) return false;
    if (delta > 0 && shouldAwakenNext(state)) return appendNext(state);
    if (delta < 0 && shouldAwakenPrevious(state)) return prependPrevious(state);
    return false;
}

export function currentSubsectionGateState() {
    const state = activeState();
    if (!state) return { hasState: false, canNext: false, canPrev: false };
    return {
        hasState: true,
        sectionIndex: state.sectionIndex,
        first: state.first,
        last: state.last,
        total: state.entries.length,
        canNext: state.last < state.entries.length - 1,
        canPrev: state.first > 0
    };
}

function ensureListeners() {
    if (window.__awtsmoosSubsectionGateListening) return;
    window.__awtsmoosSubsectionGateListening = true;
    window.addEventListener("resize", () => REGISTRY.forEach(state => setWindow(state, state.first)), { passive: true });
    document.addEventListener("awtsmoos:reader-scale", () => REGISTRY.forEach(state => setWindow(state, state.first)));
}

function updateDebugPanel() {
    if (!debugOn()) return;
    if (!debugNode) {
        debugNode = document.createElement("div");
        debugNode.id = "awtsmoosVirtualDebugPanel";
        debugNode.style.cssText = "position:fixed;left:12px;bottom:95px;z-index:999999;background:#06101f;color:#ffe08a;border:1px solid #7b5cff;border-radius:14px;padding:10px 12px;font:700 13px system-ui;box-shadow:0 12px 34px #000a;max-width:320px;pointer-events:none";
        document.body.appendChild(debugNode);
    }
    const stat = [...REGISTRY.values()].map(s => `${s.sectionIndex}:${s.first}-${s.last}/${s.entries.length}`).join(" · ");
    const awake = document.querySelectorAll("#realPost .sub-awtsmoos[data-awtsmoos-substate='awake']").length;
    debugNode.textContent = `B\"H smooth subsection stream; awake ${awake}; ${stat}`;
}

export function makeVirtualSubsectionWindow(texts, sectionIndex, targetSub = null) {
    const wrapper = document.createElement("div");
    wrapper.className = "awtsmoos-subsection-wrap awtsmoos-subsection-window toichen";
    wrapper.dataset.awtsmoosIdx = String(sectionIndex);
    wrapper.dataset.virtualSubsections = "smooth-subsection-first";

    const entries = texts.map((text, index) => ({ index, text })).filter(entry => String(entry.text || "").trim());
    const target = clamp(Number.isFinite(targetSub) ? targetSub : asNum(targetSub, 0), 0, Math.max(0, entries.length - 1));
    const count = desiredCount(entries.length);
    const first = clamp(target - Math.floor(count / 2), 0, Math.max(0, entries.length - count));
    const state = { wrapper, sectionIndex, entries, first, last: Math.min(entries.length - 1, first + count - 1), target };
    REGISTRY.set(String(sectionIndex), state);
    ensureListeners();
    rebuild(state);
    return wrapper;
}

export function awakenSubsectionByCoordinate(idx, sub) {
    if (sub === null || sub === undefined || sub === "") return null;
    const state = REGISTRY.get(String(idx));
    if (!state) return null;
    const target = clamp(asNum(sub, 0), 0, Math.max(0, state.entries.length - 1));
    const count = desiredCount(state.entries.length);
    setWindow(state, target - Math.floor(count / 2));
    return state.wrapper.querySelector(`.sub-awtsmoos[data-awtsmoos-sub="${target}"]`);
}

export function forgetSubsectionWindowsInside(container) {
    container?.querySelectorAll?.(".awtsmoos-subsection-window[data-awtsmoos-idx]").forEach(node => REGISTRY.delete(node.dataset.awtsmoosIdx));
    updateDebugPanel();
}

window.__awtsmoosRevealSubsection = awakenSubsectionByCoordinate;
window.__awtsmoosConsumeSubsectionScrollIntent = consumeSubsectionScrollIntent;
window.__awtsmoosSubsectionVirtualStats = () => [...REGISTRY.values()].map(state => ({
    sectionIndex: state.sectionIndex,
    total: state.entries.length,
    first: state.first,
    last: state.last,
    awake: Math.max(0, state.last - state.first + 1),
    mode: "smooth-subsection-first"
}));
