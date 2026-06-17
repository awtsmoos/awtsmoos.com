// B"H
export function directorPlan(id, intents = []) { return { id, intents, mood:intents.find(i=>i.goal==='mood')?.detail?.mood || 'wonder' }; }
