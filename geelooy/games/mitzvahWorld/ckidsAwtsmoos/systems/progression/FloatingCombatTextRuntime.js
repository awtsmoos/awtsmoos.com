// B"H
/**
 * @file FloatingCombatTextRuntime.js
 * @description
 * Chapter 623: A number rises above the field like a spark returning. It is
 * only UI payload, but in the code it refuses silence: miss, dodge, crit, XP,
 * and warning all become visible to desktop and mobile players.
 */
export function floatText(olam, text, options = {}) {
  const payload = { text: String(text || ""), kind: options.kind || "combat", color: options.color || "#ffe680", worldPosition: options.worldPosition || null, at: Date.now() };
  olam?.ayshPeula?.("ui event", "floatingCombatText", payload);
  olam?.ayshPeula?.("ui event", "effectsOverlay", { text: payload.text, color: payload.color, replace: options.replace === true });
  return payload;
}
export function combatNumber(olam, amount, target, options = {}) {
  const sign = amount >= 0 && !options.heal ? "-" : "+";
  const text = options.text || `${sign}${Math.round(Math.abs(amount))}`;
  const color = options.color || (options.heal ? "#7dff9a" : options.crit ? "#ffd700" : "#ff9d66");
  const pos = target?.mesh?.position?.clone?.() || target?.position || null;
  return floatText(olam, text, { ...options, color, worldPosition: pos });
}
export function warningText(olam, text) { return floatText(olam, text, { kind: "warning", color: "#ff4b43", replace: true }); }
export default { floatText, combatNumber, warningText };
