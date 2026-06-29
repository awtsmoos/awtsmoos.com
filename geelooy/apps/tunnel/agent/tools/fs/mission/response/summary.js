// B"H
function slimRound(round = {}) { return round && round.id ? { id: round.id, status: round.status, steps: (round.steps || []).map(s => ({ index: s.index, title: s.title, status: s.status })) } : round; }
function slimStep(step = {}) { return step && step.id ? { id: step.id, index: step.index, title: step.title, status: step.status, evidence: step.evidence || [] } : step; }
module.exports = { slimRound, slimStep };
