// B"H
/**
 * @module SubsectionVirtualizer
 * @description
 * The baby-subsection river must be invisible as machinery.
 *
 * This version chooses holy smoothness over clever pruning:
 * - scrolling down only appends below;
 * - scrolling up only prepends above with anchor preservation;
 * - stopping does not prune, rebuild, snap, or correct;
 * - the DOM may grow during a long reading session, but the eye is never shoved.
 *
 * The Awtsmoos can optimize later. The reader must not feel the gears now.
 */

import { sanitizeContent, appendHTML, isFirstCharacterHebrew } from "/heichelos/post/postFunctions.js";

const AHEAD_PX = 1800;
const FORCE_AHEAD_PX = 2600;
const ACTIVE_PAD_PX = 2600;
const MIN_DELTA = 2;
const MIN_AWAKE = 4;
const MAX_AWAKE = 8;
const REGISTRY = new Map();
let pendingInline = 0;
let debugNode = null;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const asNum = (value, fallback = 0) => {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) ? n : fallback;
};
const debugOn = () => new URLSearchParams(location.search).get("vdebug") === "1";

function markMotion() {
    window.__awtsmoosVirtualMotionActive = true;
    clearTimeout(window.__awtsmoosVirtualMotionIdleTimer);
    window.__awtsmoosVirtualMotionIdleTimer = setTimeout(() => {
        window.__awtsmoosVirtualMotionActive = false;
        updateDebugPanel();
    }, 900);
}

function readerFontPx() {
    const css = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--awtsmoos-reader-font-size"));
    if (Number.isFinite(css)) return css;
    const sample = document.querySelector(".toichen, .section, #realPost");
    const found = sample ? Number.parseFloat(getComputedStyle(sample).fontSize) : NaN;
    return Number.isFinite(found) ? found : 42;
}

function desiredCount(total) {
    const font = clamp(readerFontPx(), 18, 180);
    const room = Math.max(420, window.innerHeight || 720);
    const byFont = Math.floor(room / (font * 2.7)) + 3;
    return Math.min(total, clamp(byFont, MIN_AWAKE, MAX_AWAKE));
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
    }, 120);
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

function visibleAnchor() {
    const probe = Math.min(window.innerHeight * 0.36, window.innerHeight - 160);
    let best = null;
    let distance = Infinity;
    document.querySelectorAll("#realPost .sub-awtsmoos[data-awtsmoos-substate='awake']").forEach(node => {
        const rect = node.getBoundingClientRect();
        if (rect.bottom < -240 || rect.top > window.innerHeight + 240) return;
        const d = rect.top <= probe && rect.bottom >= probe ? 0 : Math.min(Math.abs(rect.top - probe), Math.abs(rect.bottom - probe));
        if (d < distance) {
            best = node;
            distance = d;
        }
    });
    return best ? { node: best, top: best.getBoundingClientRect().top } : null;
}

function preserveAnchor(anchor) {
    if (!anchor?.node?.isConnected) return;
    const nextTop = anchor.node.getBoundingClientRect().top;
    const delta = nextTop - anchor.top;
    if (Math.abs(delta) > 0.5) window.scrollBy(0, delta);
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
    markMotion();
    state.last += 1;
    state.wrapper.appendChild(makeAwake(state.entries[state.last], state.sectionIndex));
    stamp(state);
    return true;
}

function prependPrevious(state) {
    if (state.first <= 0) return false;
    markMotion();
    state.first -= 1;
    const anchor = visibleAnchor();
    state.wrapper.insertBefore(makeAwake(state.entries[state.first], state.sectionIndex), state.wrapper.firstChild);
    preserveAnchor(anchor);
    stamp(state);
    return true;
}

function activeState() {
    let best = null;
    let bestDistance = Infinity;
    const probe = Math.min(window.innerHeight * 0.48, window.innerHeight - 120);
    REGISTRY.forEach(state => {
        const rect = state.wrapper.getBoundingClientRect();
        if (rect.bottom < -ACTIVE_PAD_PX || rect.top > window.innerHeight + ACTIVE_PAD_PX) return;
        const distance = rect.top <= probe && rect.bottom >= probe ? 0 : Math.min(Math.abs(rect.top - probe), Math.abs(rect.bottom - probe));
        if (distance < bestDistance) {
            best = state;
            bestDistance = distance;
        }
    });
    return best;
}

function shouldAwakenNext(state, force = false) {
    if (state.last >= state.entries.length - 1) return false;
    if (force) return true;
    const last = state.wrapper.lastElementChild?.getBoundingClientRect();
    const wrap = state.wrapper.getBoundingClientRect();
    return Boolean(last && (last.bottom < window.innerHeight + AHEAD_PX || wrap.bottom < window.innerHeight + FORCE_AHEAD_PX));
}

function shouldAwakenPrevious(state, force = false) {
    if (state.first <= 0) return false;
    if (force) return true;
    const first = state.wrapper.firstElementChild?.getBoundingClientRect();
    const wrap = state.wrapper.getBoundingClientRect();
    return Boolean(first && (first.top > -AHEAD_PX || wrap.top > -FORCE_AHEAD_PX));
}

export function ensureSubsectionBuffer(direction = 1, options = {}) {
    const state = activeState();
    if (!state) return false;
    const force = !!options.force;
    let changed = false;
    const count = clamp(options.count || 1, 1, 6);
    for (let i = 0; i < count; i++) {
        if (direction >= 0 && shouldAwakenNext(state, force)) changed = appendNext(state) || changed;
        else if (direction < 0 && shouldAwakenPrevious(state, force)) changed = prependPrevious(state) || changed;
        else break;
    }
    return changed;
}

export function consumeSubsectionScrollIntent(delta, options = {}) {
    if (Math.abs(delta) < MIN_DELTA && !options.force) return false;
    markMotion();
    return ensureSubsectionBuffer(delta >= 0 ? 1 : -1, options);
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
    debugNode.textContent = `B\"H no-prune stream; awake ${awake}; ${stat}`;
}

export function makeVirtualSubsectionWindow(texts, sectionIndex, targetSub = null) {
    const wrapper = document.createElement("div");
    wrapper.className = "awtsmoos-subsection-wrap awtsmoos-subsection-window toichen";
    wrapper.dataset.awtsmoosIdx = String(sectionIndex);
    wrapper.dataset.virtualSubsections = "smooth-no-prune-subsection-first";

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

/**
 * Legacy compatibility only. During a reader session, already-awakened
 * subsection windows must never be forgotten or deleted.
 * @returns {false} Always false; no destructive work performed.
 */
export function forgetSubsectionWindowsInside() {
    updateDebugPanel();
    return false;
}

window.__awtsmoosRevealSubsection = awakenSubsectionByCoordinate;
window.__awtsmoosConsumeSubsectionScrollIntent = consumeSubsectionScrollIntent;
window.__awtsmoosEnsureSubsectionBuffer = ensureSubsectionBuffer;
window.__awtsmoosSubsectionVirtualStats = () => [...REGISTRY.values()].map(state => ({
    sectionIndex: state.sectionIndex,
    total: state.entries.length,
    first: state.first,
    last: state.last,
    awake: Math.max(0, state.last - state.first + 1),
    mode: "smooth-no-prune-subsection-first"
}));
