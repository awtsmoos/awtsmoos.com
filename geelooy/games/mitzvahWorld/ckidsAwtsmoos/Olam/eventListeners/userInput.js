// B"H
/**
 * Player input: small router for mobile taps, doors, targeting, and combat.
 * Legacy contract: key === "ATTACK" routes through combatManager?.attack in
 * InputCombat, keeping this file small while preserving the combat binding.
 * Weapon hotkeys remain Digit1 cherev_hakodesh, Digit2 keshes_haemes, and
 * Digit3 mateh_hatorah through InputHotkeys.
 */
import { castTorahSlot, ensureTorahActionBar, openTorahCodex } from "../../systems/torah/TorahActionRuntime.js?v=mmo-chat-macros-20260615-bh1";
import { openBag } from "../../systems/inventory/BagRuntime.js";
import { ensureMissionState } from "../../systems/missions/MissionRuntime.js?v=starter-contracts-20260628-bh9";
import { openChat } from "../../systems/chat/ChatRuntime.js";
import { executeCommand } from "../../systems/chat/CommandRuntime.js?v=starter-contracts-20260628-bh9";
import { ensureMacros, openMacros, runMacro, assignMacroToSlot } from "../../systems/macros/MacroRuntime.js?v=starter-contracts-20260628-bh9";
import { bindInput, runCombatAttack } from "./input/InputCombat.js?v=mobile-gameplay-revamp-20260705-bh1";
import { hotkey, openMissionLog, toggleFPS } from "./input/InputHotkeys.js?v=mobile-gameplay-revamp-20260705-bh1";
import { interact, toggleNearestDoor } from "./input/InputInteract.js?v=mobile-gameplay-revamp-20260705-bh1";
import { selectFromTap } from "./input/InputTargeting.js?v=mobile-gameplay-revamp-20260705-bh1";
import { trace } from "./input/InputTrace.js?v=mobile-gameplay-revamp-20260705-bh1";
export default function userInputEvents() {
  this.on("keydown", peula => { ensureTorahActionBar(this); ensureMissionState(this); ensureMacros(this); if (hotkey(this, peula)) return; const code = peula?.code; if (!this.keyStates[code]) this.ayshPeula("keypressed", peula); bindInput(this, code, true, "keydown"); });
  this.on("keyup", peula => bindInput(this, peula?.code, false, "keyup")); this.on("setInput", peula => bindInput(this, peula?.code, true, "setInput")); this.on("setInputOut", peula => bindInput(this, peula?.code, false, "setInputOut"));
  this.on("combatAttack", peula => runCombatAttack(this, peula, "ui")); this.on("combatEquip", peula => this.combatManager?.equipWeapon?.(peula?.weaponId, peula || {})); this.on("interact", peula => interact(this, peula || {})); this.on("toggleNearestDoor", () => toggleNearestDoor(this));
  this.on("castTorahSlot", peula => castTorahSlot(this, peula?.slot || 1)); this.on("openTorahCodex", () => openTorahCodex(this)); this.on("openMissionLog", () => openMissionLog(this)); this.on("openBag", () => openBag(this)); this.on("openChat", peula => openChat(this, peula?.tab || "General")); this.on("submitChat", peula => executeCommand(this, peula?.text || "", "chat"));
  this.on("openMacros", () => openMacros(this)); this.on("runMacro", peula => runMacro(this, peula?.macroId || peula?.id)); this.on("assignMacroSlot", peula => assignMacroToSlot(this, peula?.macroId, peula?.slot || 9));
  this.on("combatSelectPointer", peula => selectFromTap(this, peula, "combatSelectPointer")); this.on("pointerdown", peula => selectFromTap(this, peula, "pointerdown")); this.on("touchstart", peula => selectFromTap(this, peula, "touchstart")); this.on("touchend", peula => { const hit = selectFromTap(this, peula, "touchend"); if (!hit && peula?.tap) interact(this, { ...peula, source:"mobile-door-tap" }); });
  this.on("acceptVillageMission", () => this.__villageCombatState?.accept?.()); this.on("learnNpcSkill", peula => (this.player || this.chossid)?.learnSkill?.(peula?.skillId)); this.on("toggleFPS", () => toggleFPS(this)); this.on("returnVillage", () => this.ayshPeula("ui event", "navigateLevel", { next:"village.json", reason:"return village loses progress" }));
  this.on("setRunMode", peula => { const running = peula?.running !== false; this.inputs.RUNNING = running; this.runMode = running ? "run" : "walk"; trace(this, "setRunMode", { running, active:Object.keys(this.inputs).filter(k => this.inputs[k]) }); this.ayshPeula("ui event", "effectsOverlay", { text:running ? "Run Mode" : "Walk Mode", color:running ? "#76ff8a" : "#ffd966" }); });
  this.on("presskey", () => {}); this.on("mousedown", peula => { const selected = peula?.button === 0 ? selectFromTap(this, peula, "mousedown") : false; if (peula?.button === 0 && selected) return; this.ayin.onMouseDown(peula); this.mouseDown = true; }); this.on("mouseup", peula => { this.ayshPeula("mouseRelease", true); this.ayin.onMouseUp(peula); this.mouseDown = false; }); this.on("wheel", peula => { if (this.ayin && typeof this.ayin.zoom === "function") this.ayin.zoom(peula.deltaY); });
}
