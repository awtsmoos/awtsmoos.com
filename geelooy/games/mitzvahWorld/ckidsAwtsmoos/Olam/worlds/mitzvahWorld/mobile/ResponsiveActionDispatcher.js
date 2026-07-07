// B"H
/**
 * @file ResponsiveActionDispatcher.js
 * @description Mobile taps and desktop keys enter one small action river.
 */
const DEFAULT_MAP = Object.freeze({ KeyE:"interact", KeyI:"openInventory", KeyT:"openTorahDebate", KeyV:"attack", Space:"jump", Digit1:"slot1", Digit2:"slot2", Digit3:"slot3", Digit4:"slot4", Digit5:"slot5", Digit6:"slot6", TouchPrimary:"interact", TouchAttack:"attack", inventoryButton:"openInventory", chumashButton:"openChumashReader" });
const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function codeOf(input) {
  return input?.code || input?.type || "Unknown";
}

function deviceFrom(env = {}, input = {}) {
  return input.device || (env.hasTouch || num(env.width, 9999) <= 700 || input.type === "tap" ? "mobile" : "desktop");
}

function digitSlot(code) {
  const digit = /^Digit([1-9])$/.exec(code || "");
  if (digit) return Number(digit[1]) - 1;
  const touch = /^touchSlot:([1-8])$/.exec(code || "");
  return touch ? Number(touch[1]) : null;
}

function source(device) {
  return device === "touch" ? "mobile" : device;
}

export class ResponsiveActionDispatcher {
  constructor(actions = {}, map = DEFAULT_MAP) {
    this.actions = actions;
    this.map = { ...map };
  }

  resolveActionSlot(code, device) {
    if (/^touchSlot:9$/.test(code || "")) return null;
    const key = device === "mobile" || device === "touch" ? `Touch${code}` : code;
    return this.map[key] || this.map[code] || null;
  }

  normalize(input = {}, env = {}) {
    const device = deviceFrom(env, input), code = codeOf(input), slot = digitSlot(code);
    if (slot !== null) return { device, action:"actionBar", slot };
    if (input.type === "tap" || code === "click" || code === "KeyE" || this.resolveActionSlot(code, device) === "interact") return { device, action:"activate" };
    const mapped = this.resolveActionSlot(code, device);
    if (mapped === "openInventory" || mapped === "openChumashReader" || mapped === "openTorahDebate") return { device, action:mapped };
    return { device, action:mapped || "unknown", code:mapped ? undefined : code };
  }

  dispatch(input = {}, target = this.actions, env = {}) {
    const normalized = this.normalize(input, env), from = source(normalized.device);
    const result = { action:normalized.action, source:from };
    if (normalized.slot !== undefined) result.slot = normalized.slot;
    if (normalized.code && normalized.action === "unknown") result.code = normalized.code;
    if (normalized.action === "activate" && target?.activate) return target.activate(input, { ...normalized, source:from });
    if (normalized.action === "actionBar" && target?.activateActionSlot) return target.activateActionSlot(normalized.slot, input, { ...normalized, source:from });
    const mapped = this.resolveActionSlot(codeOf(input), normalized.device);
    const action = mapped ? this.actions[mapped] : this.actions[normalized.action];
    if (typeof action === "function") return action(input, { ...normalized, source:from });
    return result;
  }
}

export default ResponsiveActionDispatcher;
