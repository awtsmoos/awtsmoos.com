// B"H
/** @file ResponsiveActionDispatcher.js @description Mobile/keyboard action routing without nullish syntax. */
const DEFAULT_MAP = Object.freeze({ KeyE:"interact", KeyV:"attack", Space:"jump", Digit1:"slot1", Digit2:"slot2", TouchPrimary:"interact", TouchAttack:"attack" });
function codeOf(input) { return input && input.code ? input.code : input && input.type ? input.type : "Unknown"; }
function deviceOf(input) { return input && input.device ? input.device : "keyboard"; }
export class ResponsiveActionDispatcher {
  constructor(actions = {}, map = DEFAULT_MAP) { this.actions = actions; this.map = Object.assign({}, map); }
  resolveActionSlot(code, device) { const key = device === "touch" ? `Touch${code}` : code; return this.map[key] || this.map[code] || null; }
  dispatch(input = {}) { const code = codeOf(input), device = deviceOf(input); const slot = input.slot !== undefined && input.slot !== null ? input.slot : this.resolveActionSlot(code, device); const action = slot ? this.actions[slot] : null; if (typeof action === "function") return action(input); return false; }
}
export default ResponsiveActionDispatcher;
