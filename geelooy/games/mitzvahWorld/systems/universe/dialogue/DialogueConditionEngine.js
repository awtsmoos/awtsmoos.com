// B"H
export function checkDialogueCondition(condition = {}, state = {}) { if (!condition.type) return true; if (condition.type === "memory") return Boolean(state.memory?.includes(condition.key)) === (condition.value !== false); if (condition.type === "quest") return state.quests?.[condition.id] === condition.state; if (condition.type === "relationshipAtLeast") return (state.relationships?.[condition.target] || 0) >= condition.value; return true; }
export function conditionsPass(conditions = [], state = {}) { return conditions.every(c => checkDialogueCondition(c, state)); }
