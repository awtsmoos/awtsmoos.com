// B"H
import { resolveDialogueNode } from "../dialogue/DialogueStateResolver.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { chooseDialogue } from "../dialogue/DialogueChoiceRuntime.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { applyDialogueConsequences } from "../dialogue/DialogueConsequenceRuntime.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export class NpcDialogueRuntime { constructor(dialogues = []) { this.dialogues = new Map(dialogues.map(d => [d.id, d])); } talk(dialogueId, state = {}, nodeId = null) { const dialogue = this.dialogues.get(dialogueId); const node = resolveDialogueNode(dialogue, nodeId); return { dialogueId, node, choices:node ? (node.choices || []) : [] }; } choose(dialogueId, nodeId, index, state = {}) { const dialogue = this.dialogues.get(dialogueId); const node = resolveDialogueNode(dialogue, nodeId); const choice = chooseDialogue(node, index, state); const nextState = applyDialogueConsequences(state, choice?.consequences || []); return { choice, nextState, nextNodeId:choice?.to || null }; } }
export default NpcDialogueRuntime;
