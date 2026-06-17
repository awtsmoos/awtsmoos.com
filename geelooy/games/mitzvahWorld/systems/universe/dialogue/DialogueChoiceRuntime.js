// B"H
import { conditionsPass } from "./DialogueConditionEngine.js";
export function availableChoices(node = {}, state = {}) { return (node.choices || []).filter(choice => conditionsPass(choice.conditions || [], state)); }
export function chooseDialogue(node = {}, index = 0, state = {}) { return availableChoices(node, state)[index] || null; }
