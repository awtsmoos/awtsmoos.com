// B"H
/** @file userInput.js @description WoW-like input routing; combat, chat, inventory, macros, door interaction, and diagnostics. */
import PointerUpdater from "../methods/interaction/PointerUpdater.js";
import { castTorahSlot, ensureTorahActionBar, openTorahCodex } from "../../systems/torah/TorahActionRuntime.js?v=mmo-chat-macros-20260615-bh1";
import { openBag } from "../../systems/inventory/BagRuntime.js";
import { ensureMissionState, missionUiPayload } from "../../systems/missions/MissionRuntime.js";
import { openChat, closeChat } from "../../systems/chat/ChatRuntime.js";
import { executeCommand } from "../../systems/chat/CommandRuntime.js?v=npc-perform-talk-20260616-bh1";
import { ensureMacros, openMacros, runMacro, assignMacroToSlot } from "../../systems/macros/MacroRuntime.js?v=npc-perform-talk-20260616-bh1";
import { toggleNearestDoor } from "../worlds/mitzvahWorld/region/houses/door/DoorInteractionRuntime.js?v=door-interaction-runtime-20260615-bh2";
const WEAPON_KEYS = Object.freeze({ ShiftDigit1:"cherev_hakodesh", ShiftDigit2:"keshes_haemes", ShiftDigit3:"mateh_hatorah" });
const TORAH_SLOT_KEYS = Object.freeze({ Digit1:1, Digit2:2, Digit3:3, Digit4:4, Digit5:5, Digit6:6, Digit7:7, Digit8:8, Digit9:9 });
function trace(olam, stage, payload = {}) { const at = Date.now(), active = Array.isArray(payload.active) ? payload.active.length : 0, cadence = active > 0 ? 900 : 2200; if (olam.__lastOlamInputTraceAt && at - olam.__lastOlamInputTraceAt < cadence) return; olam.__lastOlamInputTraceAt = at; olam.__movementTrace ||= []; olam.__movementTrace.push({ at, stage, ...payload }); olam.__movementTrace = olam.__movementTrace.slice(-80); }
function emitCombatDiag(olam, stage, payload = {}) { olam.__combatInputTrace ||= []; const item = { at:Date.now(), stage, ...payload }; olam.__combatInputTrace.push(item); olam.__combatInputTrace = olam.__combatInputTrace.slice(-30); try { olam?.ayshPeula?.("ui event", "combatLog", { text:`DIAG ${stage}`, category:"Input" }); } catch {} return item; }
function runCombatAttack(olam, peula = {}, source = "ui") { const payload = attackPayload(peula, source); emitCombatDiag(olam, "combatAttack:start", { payload }); try { const result = olam.combatManager?.attack?.(payload); emitCombatDiag(olam, "combatAttack:end", { ok:result?.ok, reason:result?.reason, dealt:result?.dealt, distance:result?.distance }); return result; } catch (error) { emitCombatDiag(olam, "combatAttack:error", { message:error?.message || String(error) }); console.error("B\"H - combatAttack diagnostic wrapper caught", error); return null; } }
function toggleFPS(olam) { if (!olam?.ayin) return; olam.ayin.isFPS = !olam.ayin.isFPS; olam.ayshPeula("setFPS", olam.ayin.isFPS); olam.ayshPeula("ui event", "effectsOverlay", { text:olam.ayin.isFPS ? "First person" : "Third person", color:"#7dfcff" }); }
function closeTopUi(olam) { closeChat(olam); olam.ayshPeula("ui event", "closeTopPanel", {}); olam.showingImportantMessage = false; }
function openMissionLog(olam) { ensureMissionState(olam); const payload = missionUiPayload(olam); olam?.ayshPeula?.("ui event", "shlichusBook", { ...payload, open:true, updateShlichus:payload.active }); olam?.ayshPeula?.("ui event", "effectsOverlay", { text:"MISSION LOG", color:"#ffd700" }); }
function modifiedCode(peula) { return peula?.shiftKey ? `Shift${peula.code}` : peula?.code; }
function attackPayload(peula = {}, source = "ui") { return { ...(peula || {}), source:peula?.source || source }; }
function bindInput(olam, code, value, source, keepRunning = true) { if (!code) return; olam.keyStates[code] = value; const key = olam.keyBindings?.[code]; if (!key) return trace(olam, `${source}-unbound`, { code }); if (key === "ATTACK") { if (value === true) runCombatAttack(olam, { source, allowAutoFace:true }, source); return trace(olam, source, { code, key, value, active:["ATTACK"] }); } if (value === false && keepRunning && key === "RUNNING") return; olam.inputs[key] = value; trace(olam, source, { code, key, value, active:Object.keys(olam.inputs).filter(k => olam.inputs[k]) }); }
function updatePointerFromPacket(olam, peula = {}) { const x = peula.clientX ?? peula.x ?? peula.touches?.[0]?.clientX, y = peula.clientY ?? peula.y ?? peula.touches?.[0]?.clientY; if (x !== undefined && y !== undefined) PointerUpdater.update(olam, x, y); }
function selectFromTap(olam, peula = {}, source = "tap") { updatePointerFromPacket(olam, peula); const result = olam.combatManager?.selectTargetFromPointer?.({ source }); olam.__lastCombatTapSelection = { at:Date.now(), source, result, pointer:{ x:olam.pointer?.x, y:olam.pointer?.y } }; if (result === "selected" || result === "confirmed") { olam.ayshPeula("ui event", "effectsOverlay", { text:result === "selected" ? "TARGET SELECTED" : "TARGET READY", color:"#ffd95a" }); return true; } return false; }
function interact(olam) { const door = toggleNearestDoor(olam); if (door) return true; olam.ayshPeula?.("ui event", "effectsOverlay", { text:"NOTHING TO INTERACT", color:"#ffd966" }); return false; }
function hotkey(olam, peula) { const code = modifiedCode(peula); if (WEAPON_KEYS[code]) { olam.combatManager?.equipWeapon?.(WEAPON_KEYS[code]); return true; } if (TORAH_SLOT_KEYS[peula?.code]) { castTorahSlot(olam, TORAH_SLOT_KEYS[peula.code]); return true; } if (peula?.code === "Enter") { openChat(olam, "General"); return true; } if (peula?.code === "Tab") { peula.preventDefault?.(); olam.combatManager?.cycleTarget?.(); return true; } if (peula?.code === "KeyF" || code === "ShiftKeyE") { interact(olam); return true; } if (peula?.code === "KeyV") { runCombatAttack(olam, { source:"keyV", allowAutoFace:true, preferMelee:true }, "keyV"); return true; } if (peula?.code === "KeyL" || peula?.code === "KeyM") { openMissionLog(olam); return true; } if (peula?.code === "KeyK") { openTorahCodex(olam); return true; } if (peula?.code === "KeyB") { openBag(olam); return true; } if (peula?.code === "KeyP") { openMacros(olam); return true; } if (peula?.code === "Escape") { closeTopUi(olam); return true; } return false; }
export default function userInputEvents() {
  this.on("keydown", peula => { ensureTorahActionBar(this); ensureMissionState(this); ensureMacros(this); if (hotkey(this, peula)) return; const code = peula?.code; if (!this.keyStates[code]) this.ayshPeula("keypressed", peula); bindInput(this, code, true, "keydown"); });
  this.on("keyup", peula => bindInput(this, peula?.code, false, "keyup"));
  this.on("setInput", peula => bindInput(this, peula?.code, true, "setInput"));
  this.on("setInputOut", peula => bindInput(this, peula?.code, false, "setInputOut"));
  this.on("combatAttack", peula => runCombatAttack(this, peula, "ui"));
  this.on("combatEquip", peula => this.combatManager?.equipWeapon?.(peula?.weaponId, peula || {}));
  this.on("interact", () => interact(this));
  this.on("toggleNearestDoor", () => toggleNearestDoor(this));
  this.on("castTorahSlot", peula => castTorahSlot(this, peula?.slot || 1));
  this.on("openTorahCodex", () => openTorahCodex(this));
  this.on("openMissionLog", () => openMissionLog(this));
  this.on("openBag", () => openBag(this));
  this.on("openChat", peula => openChat(this, peula?.tab || "General"));
  this.on("submitChat", peula => executeCommand(this, peula?.text || "", "chat"));
  this.on("openMacros", () => openMacros(this));
  this.on("runMacro", peula => runMacro(this, peula?.macroId || peula?.id));
  this.on("assignMacroSlot", peula => assignMacroToSlot(this, peula?.macroId, peula?.slot || 9));
  this.on("combatSelectPointer", peula => selectFromTap(this, peula, "combatSelectPointer"));
  this.on("pointerdown", peula => selectFromTap(this, peula, "pointerdown"));
  this.on("touchstart", peula => selectFromTap(this, peula, "touchstart"));
  this.on("acceptVillageMission", () => this.__villageCombatState?.accept?.());
  this.on("learnNpcSkill", peula => (this.player || this.chossid)?.learnSkill?.(peula?.skillId));
  this.on("toggleFPS", () => toggleFPS(this));
  this.on("returnVillage", () => this.ayshPeula("ui event", "navigateLevel", { next:"village.json", reason:"return village loses progress" }));
  this.on("setRunMode", peula => { const running = peula?.running !== false; this.inputs.RUNNING = running; this.runMode = running ? "run" : "walk"; trace(this, "setRunMode", { running, active:Object.keys(this.inputs).filter(k => this.inputs[k]) }); this.ayshPeula("ui event", "effectsOverlay", { text:running ? "Run Mode" : "Walk Mode", color:running ? "#76ff8a" : "#ffd966" }); });
  this.on("presskey", () => {});
  this.on("mousedown", peula => { const selected = peula?.button === 0 ? selectFromTap(this, peula, "mousedown") : false; if (peula?.button === 0 && selected) return; this.ayin.onMouseDown(peula); this.mouseDown = true; });
  this.on("mouseup", peula => { this.ayshPeula("mouseRelease", true); this.ayin.onMouseUp(peula); this.mouseDown = false; });
  this.on("wheel", peula => { if (this.ayin && typeof this.ayin.zoom === "function") this.ayin.zoom(peula.deltaY); });
}
