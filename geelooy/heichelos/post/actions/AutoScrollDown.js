// B"H
/**
 * @module AutoScrollDown
 * @description
 * Chapter 312: The green river becomes ordinary motion.
 * No virtual buffer, no synthetic hidden road, no scroll-vessel guessing maze.
 * It advances the real document scroll root and pauses for human intent.
 */

const DEFAULT_SPEED = 3.2;
const MIN_SPEED = 0.35;
const MAX_SPEED = 18;
const SPEED_KEY = "awtsmoos-auto-scroll-speed";
const RESUME_DELAY_MS = 360;
const MOVE_THRESHOLD = 24;
const WHEEL_THRESHOLD = 32;

let gesture = null;
let state = { active: false, paused: false, raf: 0, resumeTimer: 0, listenersBound: false, speed: readSavedSpeed() };

const frame = fn => setTimeout(() => fn(Date.now()), 0);
const cancelFrame = id => id && clearTimeout(id);
const docRoot = () => document.scrollingElement || document.documentElement || document.body;
const top = () => window.scrollY || document.documentElement?.scrollTop || document.body?.scrollTop || docRoot()?.scrollTop || 0;
const max = () => Math.max(0, Math.max(document.body?.scrollHeight || 0, document.documentElement?.scrollHeight || 0, docRoot()?.scrollHeight || 0) - (window.innerHeight || document.documentElement?.clientHeight || docRoot()?.clientHeight || 0));
const point = event => { const t = event?.touches?.[0] || event?.changedTouches?.[0]; return { x: Number(t?.clientX ?? event?.clientX ?? 0), y: Number(t?.clientY ?? event?.clientY ?? 0) }; };
const bounded = value => { const n = Number.parseFloat(value); return Number.isFinite(n) ? Math.min(MAX_SPEED, Math.max(MIN_SPEED, n)) : DEFAULT_SPEED; };

function readSavedSpeed() { try { return bounded(localStorage.getItem(SPEED_KEY) || DEFAULT_SPEED); } catch { return DEFAULT_SPEED; } }
function saveSpeed(speed) { try { localStorage.setItem(SPEED_KEY, String(speed)); } catch {} }
function emit() { window.dispatchEvent?.(new CustomEvent("awtsmoos:auto-scroll-state", { detail: getAutoScrollDownState() })); }
function clearResume() { if (state.resumeTimer) clearTimeout(state.resumeTimer); state.resumeTimer = 0; }
function ignore(event) { return !!event?.target?.closest?.("#awtsmoosAutoScrollBtn, .typography-details, .sidebar, input, textarea, select, button, a"); }

function writeTop(next) {
    const safe = Math.max(0, Math.min(max(), next));
    window.scrollTo?.({ top: safe, behavior: "auto" });
    if (docRoot()) docRoot().scrollTop = safe;
    if (document.documentElement) document.documentElement.scrollTop = safe;
    if (document.body) document.body.scrollTop = safe;
}

function step() {
    if (!state.active) return;
    if (!state.paused) writeTop(top() + state.speed);
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

export function setAutoScrollDownSpeed(value) { const speed = bounded(value); state = { ...state, speed }; saveSpeed(speed); window.dispatchEvent?.(new CustomEvent("awtsmoos:auto-scroll-speed", { detail: { speed } })); emit(); return speed; }
export function loadAutoScrollDownSpeed() { return setAutoScrollDownSpeed(readSavedSpeed()); }
export function pauseAutoScrollDown() { if (!state.active || state.paused) return state.active; clearResume(); state = { ...state, paused: true, resumeTimer: 0 }; document.body?.classList?.add("awtsmoos-auto-scroll-paused"); emit(); return true; }
export function scheduleAutoScrollResume(delay = RESUME_DELAY_MS) { if (!state.active) return false; clearResume(); state.resumeTimer = setTimeout(() => { state = { ...state, paused: false, resumeTimer: 0 }; document.body?.classList?.remove("awtsmoos-auto-scroll-paused"); emit(); }, delay); emit(); return true; }
export function startAutoScrollDown(options = {}) { stopAutoScrollDown(); bindHumanPauseListeners(); state = { ...state, active: true, paused: false, raf: 0, resumeTimer: 0, speed: Number.isFinite(options.speed) ? bounded(options.speed) : readSavedSpeed() }; gesture = null; saveSpeed(state.speed); state.raf = frame(step); document.body?.classList?.add("awtsmoos-auto-scroll-active"); document.body?.classList?.remove("awtsmoos-auto-scroll-paused"); emit(); return true; }
export function stopAutoScrollDown() { cancelFrame(state.raf); clearResume(); gesture = null; state = { ...state, active: false, paused: false, raf: 0, resumeTimer: 0 }; document.body?.classList?.remove("awtsmoos-auto-scroll-active"); document.body?.classList?.remove("awtsmoos-auto-scroll-paused"); emit(); return false; }
export function toggleAutoScrollDown(options = {}) { return state.active ? stopAutoScrollDown() : startAutoScrollDown(options); }
export function getAutoScrollDownState() { return { active: state.active, paused: state.paused, speed: state.speed }; }
