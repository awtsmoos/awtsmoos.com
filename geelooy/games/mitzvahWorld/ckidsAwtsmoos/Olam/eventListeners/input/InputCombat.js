// B"H
/** Combat input must make the animal answer, not sit like a painted prop. */
import { trace } from "./InputTrace.js";
export function attackPayload(peula = {}, source = "ui") { return { ...(peula || {}), source:peula?.source || source }; }
export function runCombatAttack(olam, peula = {}, source = "ui") { try { return olam.combatManager?.attack?.(attackPayload(peula, source)); } catch (error) { console.error('B"H - combatAttack diagnostic wrapper caught', error); return null; } }
export function bindInput(olam, code, value, source, keepRunning = true) {
  if (!code) return;
  olam.keyStates[code] = value;
  const key = olam.keyBindings?.[code];
  if (!key) return trace(olam, `${source}-unbound`, { code });
  if (key === "ATTACK") { if (value === true) runCombatAttack(olam, { source, allowAutoFace:true }, source); return trace(olam, source, { code, key, value, active:["ATTACK"] }); }
  if (value === false && keepRunning && key === "RUNNING") return;
  olam.inputs[key] = value;
  trace(olam, source, { code, key, value, active:Object.keys(olam.inputs).filter(k => olam.inputs[k]) });
}
