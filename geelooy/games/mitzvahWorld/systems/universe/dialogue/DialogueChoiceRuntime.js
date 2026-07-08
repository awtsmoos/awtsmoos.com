// B"H
import { conditionsPass } from "./DialogueConditionEngine.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function availableChoices(node = {}, state = {}) { return (node.choices || []).filter(choice => conditionsPass(choice.conditions || [], state)); }
export function chooseDialogue(node = {}, index = 0, state = {}) { return availableChoices(node, state)[index] || null; }
