// B"H
/**
 * @file ResponsiveActionDispatcher.js
 * @description Mobile taps and desktop keys enter one small action river.
 */
const DEFAULT_MAP = Object.freeze({ KeyE:"interact", KeyV:"attack", Space:"jump", Digit1:"slot1", Digit2:"slot2", Digit3:"slot3", TouchPrimary:"interact", TouchAttack:"attack" });
const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
function codeOf(input) { return input?.code || input?.type || "Unknown"; }
function deviceFrom(env = {}, input = {}) { return input.device || (env.hasTouch || num(env.width, 9999) <= 700 || input.type === "tap" ? "mobile" : "desktop"); }
function digitSlot(code) { const match = /^Digit([1-9])$/.exec(code || ""); return match ? Number(match[1]) - 1 : null; }
export class ResponsiveActionDispatcher {
  constructor(actions = {}, map = DEFAULT_MAP) { this.actions = actions; this.map = { ...map }; }
  resolveActionSlot(code, device) { const key = device === "mobile" || device === "touch" ? `Touch${code}` : code; return this.map[key] || this.map[code] || null; }
  normalize(input = {}, env = {}) { const device = deviceFrom(env, input), code = codeOf(input), slot = digitSlot(code); if (slot !== null) return { device, action:"actionBar", slot }; if (input.type === "tap" || code === "KeyE" || this.resolveActionSlot(code, device) === "interact") return { device, action:"activate" }; const mapped = this.resolveActionSlot(code, device); return { device, action:mapped || "unknown" }; }
  dispatch(input = {}, target = this.actions, env = {}) { const normalized = this.normalize(input, env); if (normalized.action === "activate") return target?.activate?.(input, normalized); if (normalized.action === "actionBar") return target?.activateActionSlot?.(normalized.slot, input, normalized); const mapped = this.resolveActionSlot(codeOf(input), normalized.device); const action = mapped ? this.actions[mapped] : null; if (typeof action === "function") return action(input, normalized); return false; }
}
export default ResponsiveActionDispatcher;
