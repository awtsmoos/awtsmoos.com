// B"H
export class DialogueJsonRuntime { constructor(dialogues = []) { this.dialogues = new Map(dialogues.map(d => [d.id, d])); } get(id) { return this.dialogues.get(id) || null; } choose(dialogueId, nodeId, choiceIndex = 0) { const node = this.get(dialogueId)?.nodes?.[nodeId]; return node?.choices?.[choiceIndex]?.to || null; } snapshot() { return { dialogues:this.dialogues.size, ids:[...this.dialogues.keys()] }; } }
export default DialogueJsonRuntime;
