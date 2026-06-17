// B"H
export class DialogueHookRegistry { constructor(dialogues = [], npcs = []) { this.dialogues = new Map(dialogues.map(d => [d.id, d])); this.hooks = npcs.filter(n => n.dialogue).map(n => ({ npcId:n.id, dialogueId:n.dialogue })); } snapshot() { return { dialogues:this.dialogues.size, hooks:this.hooks.length, hooks:this.hooks }; } }
export default DialogueHookRegistry;
