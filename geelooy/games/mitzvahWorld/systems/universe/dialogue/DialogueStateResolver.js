// B"H
export function resolveDialogueNode(dialogue = {}, nodeId = null) { const id = nodeId || dialogue.start; return dialogue.nodes?.[id] ? { id, ...dialogue.nodes[id] } : null; }
export function nextDialogueNode(dialogue = {}, choice = {}) { return resolveDialogueNode(dialogue, choice.to || dialogue.start); }
