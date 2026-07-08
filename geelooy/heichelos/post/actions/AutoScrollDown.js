// B"H
/**
 * @module AutoScrollDown
 * @description
 * Chapter 360: The river stops asking permission from smoothness and ghosts.
 * Investigation showed the text is no longer virtualized: all verses are in the
 * native document. The slow 24x symptom came from polite absolute scroll writes
 * plus smooth-scroll CSS and delayed buffering. This vessel uses direct native
 * deltas, disables smooth behavior while active, detects stalls, and keeps the
 * old oracle awake only as a compatibility witness.
 */

const DEFAULT_SPEED = 4;
const MIN_SPEED = 1;
const MAX_SPEED = 24;
const SPEED_KEY = "awtsmoos-auto-scroll-speed";
const RESUME_DELAY_MS = 220;
const MOVE_THRESHOLD = 40;
const WHEEL_THRESHOLD = 55;
const PX_PER_SECOND_PER_X = 320;
const FRAME_CAP = 0.05;
const BUFFER_MS = 120;
const STALL_LIMIT = 5;

let lastTime = 0;
let lastBuffer = 0;
let stallFrames = 0;
let gesture = null;
let savedScrollBehavior = null;
let state = { active: false, paused: false, raf: 0, resumeTimer: 0, listenersBound: false, speed: readSavedSpeed() };

const frame = fn => (typeof requestAnimationFrame === "function" ? requestAnimationFrame(fn) : setTimeout(() => fn(Date.now()), 16));
const cancelFrame = id => (typeof cancelAnimationFrame === "function" ? cancelAnimationFrame(id) : clearTimeout(id));
const docEl = () => document.documentElement;
const body = () => document.body;
const root = () => document.scrollingElement || docEl() || body();
const viewportHeight = () => window.innerHeight || docEl()?.clientHeight || root()?.clientHeight || 0;
const top = () => Math.max(Number(window.scrollY || 0), Number(root()?.scrollTop || 0), Number(docEl()?.scrollTop || 0), Number(body()?.scrollTop || 0));
const scrollHeight = () => Math.max(Number(body()?.scrollHeight || 0), Number(docEl()?.scrollHeight || 0), Number(root()?.scrollHeight || 0));
const documentMax = () => Math.max(0, scrollHeight() - viewportHeight());
const max = documentMax;
const bounded = value => { const n = Number.parseFloat(value); return Number.isFinite(n) ? Math.min(MAX_SPEED, Math.max(MIN_SPEED, n)) : DEFAULT_SPEED; };
const point = event => { const t = event?.touches?.[0] || event?.changedTouches?.[0]; return { x: Number(t?.clientX ?? event?.clientX ?? 0), y: Number(t?.clientY ?? event?.clientY ?? 0) }; };

function readSavedSpeed() {
    try {
        const saved = Number.parseFloat(localStorage.getItem(SPEED_KEY));
        return Number.isFinite(saved) && saved >= MIN_SPEED ? bounded(saved) : DEFAULT_SPEED;
    } catch { return DEFAULT_SPEED; }
}

function saveSpeed(speed) { try { localStorage.setItem(SPEED_KEY, String(speed)); } catch {} }
function emit() { window.dispatchEvent?.(new CustomEvent("awtsmoos:auto-scroll-state", { detail: getAutoScrollDownState() })); }
function clearResume() { if (state.resumeTimer) clearTimeout(state.resumeTimer); state.resumeTimer = 0; }
function ignore(event) { return !!event?.target?.closest?.("#awtsmoosAutoScrollBtn, .typography-details, .sidebar, input, textarea, select, button, a"); }

function setSmoothDisabled(disabled) {
    const element = docEl();
    if (!element) return;
    if (disabled) {
        if (savedScrollBehavior === null) savedScrollBehavior = element.style.scrollBehavior || "";
        element.style.setProperty("scroll-behavior", "auto", "important");
        body()?.style?.setProperty?.("scroll-behavior", "auto", "important");
        return;
    }
    if (savedScrollBehavior !== null) element.style.scrollBehavior = savedScrollBehavior;
    body()?.style?.removeProperty?.("scroll-behavior");
    savedScrollBehavior = null;
}

function askOldRoad(direction = 1, force = true) {
    try { window.__awtsmoosAutoScrollVerseBuffer?.(direction, { force, count: 24 }); } catch (error) { console.warn("B\"H auto-scroll buffer failed", error); }
}

function feedRoad(now, direction = 1, force = false) {
    if (now - lastBuffer < BUFFER_MS && !force) return;
    lastBuffer = now;
    askOldRoad(direction, force || max() - top() < viewportHeight() * 8);
}

function writeTop(root, target) {
    if (root) root.scrollTop = target;
}

function writeDelta(delta) {
    const before = top();
    const target = Math.max(0, Math.min(max(), before + delta));
    const amount = target - before;
    if (Math.abs(amount) < 0.5) return 0;
    window.scrollBy?.({ top: amount, left: 0, behavior: "auto" });
    const afterScrollBy = top();
    if (Math.abs(afterScrollBy - before) < Math.abs(amount) * 0.35) {
        window.scrollTo?.(0, target);
        writeTop(root(), target);
        if (docEl()) docEl().scrollTop = target;
        if (body()) body().scrollTop = target;
    }
    return top() - before;
}

function step(now = Date.now()) {
    if (!state.active) return;
    const dt = Math.min(FRAME_CAP, Math.max(0.008, (now - (lastTime || now)) / 1000));
    lastTime = now;
    if (!state.paused) {
        const wanted = state.speed * PX_PER_SECOND_PER_X * dt;
        const moved = writeDelta(wanted);
        stallFrames = moved < Math.max(1, wanted * 0.1) && top() < max() - 2 ? stallFrames + 1 : 0;
        feedRoad(now, 1, stallFrames >= STALL_LIMIT);
    } else {
        feedRoad(now, 1, false);
    }
    if (top() >= max() - 1) return void stopAutoScrollDown();
    state.raf = frame(step);
}

function beginGesture(event) {
    if (!state.active || ignore(event)) return;
    const p = point(event);
    gesture = { x: p.x, y: p.y, scrollTop: top(), paused: false };
    clearResume();
}

function moveGesture(event) {
    if (!state.active || !gesture || ignore(event)) return;
    const p = point(event);
    if (Math.abs(p.y - gesture.y) < MOVE_THRESHOLD && Math.abs(top() - gesture.scrollTop) < MOVE_THRESHOLD) return;
    gesture.paused = true;
    pauseAutoScrollDown();
}

function endGesture() {
    const resume = !!gesture?.paused || state.paused;
    gesture = null;
    if (resume) scheduleAutoScrollResume();
}

function wheelGesture(event) {
    if (!state.active || ignore(event) || Math.abs(Number(event?.deltaY || 0)) < WHEEL_THRESHOLD) return;
    pauseAutoScrollDown();
    scheduleAutoScrollResume();
}

function keyGesture(event) {
    if (!state.active || ignore(event) || !["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) return;
    pauseAutoScrollDown();
    scheduleAutoScrollResume();
}

function bindHumanPauseListeners() {
    if (state.listenersBound || typeof document === "undefined") return;
    state.listenersBound = true;
    const opts = { passive: true, capture: true };
    ["pointerdown", "touchstart"].forEach(type => document.addEventListener(type, beginGesture, opts));
    ["pointermove", "touchmove"].forEach(type => document.addEventListener(type, moveGesture, opts));
    ["pointerup", "pointercancel", "touchend", "touchcancel"].forEach(type => document.addEventListener(type, endGesture, opts));
    document.addEventListener("wheel", wheelGesture, opts);
    document.addEventListener("keydown", keyGesture, true);
}

export function setAutoScrollDownSpeed(value) {
    const speed = bounded(value);
    state = { ...state, speed };
    saveSpeed(speed);
    window.dispatchEvent?.(new CustomEvent("awtsmoos:auto-scroll-speed", { detail: { speed } }));
    emit();
    return speed;
}

export function loadAutoScrollDownSpeed() { return setAutoScrollDownSpeed(readSavedSpeed()); }

export function pauseAutoScrollDown() {
    if (!state.active || state.paused) return state.active;
    clearResume();
    state = { ...state, paused: true, resumeTimer: 0 };
    document.body?.classList?.add("awtsmoos-auto-scroll-paused");
    emit();
    return true;
}

export function scheduleAutoScrollResume(delay = RESUME_DELAY_MS) {
    if (!state.active) return false;
    clearResume();
    state.resumeTimer = setTimeout(() => {
        state = { ...state, paused: false, resumeTimer: 0 };
        document.body?.classList?.remove("awtsmoos-auto-scroll-paused");
        lastTime = 0;
        emit();
    }, delay);
    emit();
    return true;
}

export function startAutoScrollDown(options = {}) {
    stopAutoScrollDown();
    bindHumanPauseListeners();
    state = { ...state, active: true, paused: false, raf: 0, resumeTimer: 0, speed: Number.isFinite(options.speed) ? bounded(options.speed) : readSavedSpeed() };
    gesture = null;
    lastTime = 0;
    lastBuffer = 0;
    stallFrames = 0;
    setSmoothDisabled(true);
    askOldRoad(1, true);
    saveSpeed(state.speed);
    state.raf = frame(step);
    document.body?.classList?.add("awtsmoos-auto-scroll-active");
    document.body?.classList?.remove("awtsmoos-auto-scroll-paused");
    emit();
    return true;
}

export function stopAutoScrollDown() {
    cancelFrame(state.raf);
    clearResume();
    gesture = null;
    lastTime = 0;
    stallFrames = 0;
    setSmoothDisabled(false);
    state = { ...state, active: false, paused: false, raf: 0, resumeTimer: 0 };
    document.body?.classList?.remove("awtsmoos-auto-scroll-active");
    document.body?.classList?.remove("awtsmoos-auto-scroll-paused");
    emit();
    return false;
}

export function toggleAutoScrollDown(options = {}) { return state.active ? stopAutoScrollDown() : startAutoScrollDown(options); }
export function getAutoScrollDownState() { return { active: state.active, paused: state.paused, speed: state.speed }; }