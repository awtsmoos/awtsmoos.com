// B"H
export function compileBranchingDialogue(dialogue = {}) { const nodes = dialogue.nodes || {}; return { id:dialogue.id || "dialogue", start:dialogue.start || Object.keys(nodes)[0] || null, nodes:Object.fromEntries(Object.entries(nodes).map(([id,node]) => [id, { id, text:node.text || "", choices:node.choices || [] }])) }; }
export function compileDialogueSet(dialogues = []) { return dialogues.map(compileBranchingDialogue); }
