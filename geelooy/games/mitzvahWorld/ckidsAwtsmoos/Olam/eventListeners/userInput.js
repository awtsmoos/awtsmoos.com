// B"H
/**
 * @file userInput.js
 * @description
 * Chapter 1025: mobile taps explicitly try combat selection before camera drag.
 */
import PointerUpdater from "../methods/interaction/PointerUpdater.js";
const WEAPON_KEYS = Object.freeze({ Digit1: "cherev_hakodesh", Digit2: "keshes_haemes", Digit3: "mateh_hatorah" });
function trace(olam, stage, payload = {}) { const at = Date.now(); const active = Array.isArray(payload.active) ? payload.active.length : 0; const cadence = active > 0 ? 900 : 2200; if (olam.__lastOlamInputTraceAt && at - olam.__lastOlamInputTraceAt < cadence) return; olam.__lastOlamInputTraceAt = at; olam.__movementTrace ||= []; olam.__movementTrace.push({ at, stage, ...payload }); olam.__movementTrace = olam.__movementTrace.slice(-80); }
function toggleFPS(olam) { if (!olam?.ayin) return; olam.ayin.isFPS = !olam.ayin.isFPS; olam.ayshPeula("setFPS", olam.ayin.isFPS); olam.ayshPeula("ui event", "effectsOverlay", { text: olam.ayin.isFPS ? "First person" : "Third person", color: "#7dfcff" }); }
function bindInput(olam, code, value, source, keepRunning = true) { if (!code) return; olam.keyStates[code] = value; const key = olam.keyBindings?.[code]; if (!key) return trace(olam, `${source}-unbound`, { code }); if (key === "ATTACK") { if (value === true) olam.combatManager?.attack?.({ source }); return trace(olam, source, { code, key, value, active: ["ATTACK"] }); } if (value === false && keepRunning && key === "RUNNING") return; olam.inputs[key] = value; trace(olam, source, { code, key, value, active: Object.keys(olam.inputs).filter(k => olam.inputs[k]) }); }
function updatePointerFromPacket(olam, peula = {}) { const x = peula.clientX ?? peula.x ?? peula.touches?.[0]?.clientX, y = peula.clientY ?? peula.y ?? peula.touches?.[0]?.clientY; if (x !== undefined && y !== undefined) PointerUpdater.update(olam, x, y); }
function selectFromTap(olam, peula = {}, source = "tap") { updatePointerFromPacket(olam, peula); const result = olam.combatManager?.selectTargetFromPointer?.({ source }); olam.__lastCombatTapSelection = { at: Date.now(), source, result, pointer: { x: olam.pointer?.x, y: olam.pointer?.y } }; if (result === "selected" || result === "confirmed") { olam.ayshPeula("ui event", "effectsOverlay", { text: result === "selected" ? "TARGET SELECTED" : "TARGET READY", color: "#ffd95a" }); return true; } return false; }
export default function userInputEvents() {
  this.on("keydown", peula => { const code = peula?.code; if (WEAPON_KEYS[code]) this.combatManager?.equipWeapon?.(WEAPON_KEYS[code]); if (!this.keyStates[code]) this.ayshPeula("keypressed", peula); bindInput(this, code, true, "keydown"); });
  this.on("setInput", peula => bindInput(this, peula?.code, true, "setInput")); this.on("setInputOut", peula => bindInput(this, peula?.code, false, "setInputOut"));
  this.on("combatAttack", peula => this.combatManager?.attack?.({ source: peula?.source || "ui" })); this.on("combatEquip", peula => this.combatManager?.equipWeapon?.(peula?.weaponId));
  this.on("combatSelectPointer", peula => selectFromTap(this, peula, "combatSelectPointer")); this.on("pointerdown", peula => selectFromTap(this, peula, "pointerdown")); this.on("touchstart", peula => selectFromTap(this, peula, "touchstart"));
  this.on("acceptVillageMission", () => this.__villageCombatState?.accept?.()); this.on("learnNpcSkill", peula => (this.player || this.chossid)?.learnSkill?.(peula?.skillId)); this.on("toggleFPS", () => toggleFPS(this)); this.on("returnVillage", () => this.ayshPeula("ui event", "navigateLevel", { next: "village.json", reason: "return village loses progress" }));
  this.on("setRunMode", peula => { const running = peula?.running !== false; this.inputs.RUNNING = running; this.runMode = running ? "run" : "walk"; trace(this, "setRunMode", { running, active: Object.keys(this.inputs).filter(k => this.inputs[k]) }); this.ayshPeula("ui event", "effectsOverlay", { text: running ? "Run Mode" : "Walk Mode", color: running ? "#76ff8a" : "#ffd966" }); });
  this.on("keyup", peula => bindInput(this, peula?.code, false, "keyup")); this.on("presskey", () => {});
  this.on("mousedown", peula => { const selected = peula?.button === 0 ? selectFromTap(this, peula, "mousedown") : false; if (peula?.button === 0 && selected) return; this.ayin.onMouseDown(peula); this.mouseDown = true; });
  this.on("mouseup", peula => { this.ayshPeula("mouseRelease", true); this.ayin.onMouseUp(peula); this.mouseDown = false; });
  this.on("wheel", peula => { if (this.ayin && typeof this.ayin.zoom === 'function') this.ayin.zoom(peula.deltaY); });
}
