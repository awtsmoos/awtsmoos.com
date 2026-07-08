// B"H
/** @file actionBar.js @description Compact action dock with bag slot that opens the real inventory immediately. */
import { installActionBarLayoutRuntime } from "./actionBarLayoutRuntime.js?compact=true&v=npc-pose-tap-inventory-20260708-bh2";
const ACTIONS=[
  {cls:"attack-slot",icon:"⚔️",name:"Strike",label:"V",kind:"combatAttack"},
  {cls:"sword-slot",icon:"🗡️",name:"Sword",label:"1",kind:"combatEquip",weaponId:"cherev_hakodesh"},
  {cls:"bow-slot",icon:"🏹",name:"Bow",label:"2",kind:"combatEquip",weaponId:"keshes_haemes"},
  {cls:"staff-slot",icon:"🔯",name:"Staff",label:"3",kind:"combatEquip",weaponId:"mateh_hatorah"},
  {cls:"talk-slot",icon:"💬",name:"Talk",label:"C",kind:"pulse",code:"KeyC"},
  {cls:"bag-slot",icon:"🎒",name:"Inventory",label:"I",kind:"inventory"}
];
const stop=e=>{e?.preventDefault?.();e?.stopPropagation?.();};
const worker=()=>window.mana?.socket?.eved||window.mana?.eved||null;
function send(inner){worker()?.postMessage?.({olamPeula:inner});document.querySelector('[shaym="ikar"]')?.dispatchEvent(new CustomEvent("olamPeula",{bubbles:true,detail:{olamPeula:inner}}));}
function openInventory(){const inv=document.getElementById("inventoryScreen");document.getElementById("awtsmoos-npc-overlay")?.remove();document.querySelectorAll(".awtsmoosContextMenu,.bz-panel,.construction-screen").forEach(el=>el.classList.add("hidden"));if(inv){inv.classList.remove("hidden");document.getElementById("actionBar")?.classList.add("inventory-open");inv.dispatchEvent(new CustomEvent("awtsInventoryOpen",{bubbles:true}));}send({openBag:{source:"action-bar-bag"}});}
function pulse(code){send({setInput:{code}});setTimeout(()=>send({setInputOut:{code}}),140);}
function fire(action){if(action.kind==="inventory")return openInventory();if(action.kind==="pulse")return pulse(action.code);if(action.kind==="combatAttack")return send({combatAttack:{source:"actionBar",allowAutoFace:true,preferMelee:true,mobileAssist:true}});if(action.kind==="combatEquip")return send({combatEquip:{weaponId:action.weaponId,source:"actionBar"}});}
function bindTap(el,action){let last=0;el.addEventListener("pointerdown",event=>{stop(event);const at=performance.now();if(at-last<120)return;last=at;fire(action);},{passive:false});}
function slot(action){return{className:`actionSlot ${action.cls}`,dataset:{awtsUi:"true",action:action.name},title:action.name,ready:el=>bindTap(el,action),children:[{className:"slotIcon",textContent:action.icon},{className:"slotName",textContent:action.name},{className:"slotKey",textContent:action.label}]};}
export default{shaym:"action bar",id:"actionBar",className:"awtsmoosAction combat-action-dock open",awtsmoosClick:true,ready:installActionBarLayoutRuntime,children:[{className:"slots",shaym:"action slots",id:"actionSlots",children:ACTIONS.map(slot)}],on:{updateActionSlots(){installActionBarLayoutRuntime(document.getElementById("actionBar"));}}};
