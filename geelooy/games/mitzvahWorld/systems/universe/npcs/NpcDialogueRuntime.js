// B"H
import { resolveDialogueNode } from "../dialogue/DialogueStateResolver.js";
import { chooseDialogue } from "../dialogue/DialogueChoiceRuntime.js";
import { applyDialogueConsequences } from "../dialogue/DialogueConsequenceRuntime.js";
export class NpcDialogueRuntime { constructor(dialogues = []) { this.dialogues = new Map(dialogues.map(d => [d.id, d])); } talk(dialogueId, state = {}, nodeId = null) { const dialogue = this.dialogues.get(dialogueId); const node = resolveDialogueNode(dialogue, nodeId); return { dialogueId, node, choices:node ? (node.choices || []) : [] }; } choose(dialogueId, nodeId, index, state = {}) { const dialogue = this.dialogues.get(dialogueId); const node = resolveDialogueNode(dialogue, nodeId); const choice = chooseDialogue(node, index, state); const nextState = applyDialogueConsequences(state, choice?.consequences || []); return { choice, nextState, nextNodeId:choice?.to || null }; } }
export default NpcDialogueRuntime;
