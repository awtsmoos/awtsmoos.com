// B"H
export function createQuestNode(input = {}) { return { id:input.id || "node", type:input.type || "objective", text:input.text || "", next:input.next || [] }; }
export default { createQuestNode };
