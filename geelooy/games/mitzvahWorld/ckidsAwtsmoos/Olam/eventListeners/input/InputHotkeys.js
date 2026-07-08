// B"H
/** Hotkeys remain sharp while mobile taps and door/NPC logic use the fresh gesture route. */
import { castTorahSlot, openTorahCodex } from "../../../systems/torah/TorahActionRuntime.js?compact=true&v=mmo-chat-macros-20260615-bh1";
import { openBag } from "../../../systems/inventory/BagRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { ensureMissionState, missionUiPayload } from "../../../systems/missions/MissionRuntime.js?compact=true&v=starter-contracts-20260628-bh9";
import { openChat, closeChat } from "../../../systems/chat/ChatRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { openMacros } from "../../../systems/macros/MacroRuntime.js?compact=true&v=starter-contracts-20260628-bh9";
import { runCombatAttack } from "./InputCombat.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { interact } from "./InputInteract.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const WEAPONS=Object.freeze({ShiftDigit1:"cherev_hakodesh",ShiftDigit2:"keshes_haemes",ShiftDigit3:"mateh_hatorah"});
const SLOTS=Object.freeze({Digit1:1,Digit2:2,Digit3:3,Digit4:4,Digit5:5,Digit6:6,Digit7:7,Digit8:8,Digit9:9});
function modifiedCode(peula){return peula?.shiftKey?`Shift${peula.code}`:peula?.code;}
export function closeTopUi(olam){closeChat(olam);olam.ayshPeula("ui event","closeTopPanel",{});olam.showingImportantMessage=false;}
export function openMissionLog(olam){ensureMissionState(olam);const payload=missionUiPayload(olam);olam?.ayshPeula?.("ui event","shlichusBook",{...payload,open:true,updateShlichus:payload.active});olam?.ayshPeula?.("ui event","effectsOverlay",{text:"MISSION LOG",color:"#ffd700"});}
export function toggleFPS(olam){if(!olam?.ayin)return;olam.ayin.isFPS=!olam.ayin.isFPS;olam.ayshPeula("setFPS",olam.ayin.isFPS);olam.ayshPeula("ui event","effectsOverlay",{text:olam.ayin.isFPS?"First person":"Third person",color:"#7dfcff"});}
export function hotkey(olam,peula){const code=modifiedCode(peula);if(WEAPONS[code])return olam.combatManager?.equipWeapon?.(WEAPONS[code]),true;if(SLOTS[peula?.code])return castTorahSlot(olam,SLOTS[peula.code]),true;if(peula?.code==="Enter")return openChat(olam,"General"),true;if(peula?.code==="Tab")return peula.preventDefault?.(),olam.combatManager?.cycleTarget?.(),true;if(peula?.code==="KeyF"||code==="ShiftKeyE")return interact(olam,{...peula,source:"keyboard-interact"}),true;if(peula?.code==="KeyV")return runCombatAttack(olam,{source:"keyV",allowAutoFace:true,preferMelee:true,allowAutoTarget:true},"keyV"),true;if(peula?.code==="KeyL"||peula?.code==="KeyM")return openMissionLog(olam),true;if(peula?.code==="KeyK")return openTorahCodex(olam),true;if(peula?.code==="KeyB")return openBag(olam),true;if(peula?.code==="KeyP")return openMacros(olam),true;if(peula?.code==="Escape")return closeTopUi(olam),true;return false;}
