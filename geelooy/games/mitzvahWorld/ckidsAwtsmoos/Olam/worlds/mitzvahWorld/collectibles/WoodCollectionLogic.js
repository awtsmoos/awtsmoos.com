// B"H
/** @file WoodCollectionLogic.js @description Wood collection runtime exports preserved for all import paths. */
function dataOf(group){return group&&group.userData?group.userData:{};}
function actorInventory(actor){return actor&&actor.inventory?actor.inventory:null;}
function addWood(actor,amount){const inventory=actorInventory(actor);if(inventory&&typeof inventory.addItem==='function')inventory.addItem({id:'wood',className:'Wood',name:'Wood',icon:'🪵'},amount);}
function quest(actor){if(actor&&typeof actor.updateQuestProgress==='function')actor.updateQuestProgress('collect','Wood');}
function overlay(olam,amount){if(olam&&typeof olam.ayshPeula==='function')olam.ayshPeula('ui event','effectsOverlay',{text:`+${amount} wood`,color:'#d79a48'});}
export function collectWood(group,actor,olam,amount=1){const data=dataOf(group);if(data.collected)return false;data.collected=true;if(group)group.visible=false;addWood(actor,amount);quest(actor);overlay(olam,amount);return true;}
export const collectWoodRuntime=collectWood;
export default collectWood;
