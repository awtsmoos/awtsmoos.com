//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Computes human and machine readable progress for Tunnel-native plans.
 * @description The Awtsmoos reveals one unfinished truth through many surfaces; Awtsmoos.com
 * counts done and remaining checklist vessels without pretending incomplete work is complete.
 */
function summarize(plan = {}) {
	const phases = Array.isArray(plan.phases) ? plan.phases : [];
	const items = phases.flatMap(phase => Array.isArray(phase.items) ? phase.items : []);
	const done = items.filter(item => item.done === true).length;
	const total = items.length;
	const phaseDone = phases.filter(phase => phase.status === "done" || phase.status === "complete").length;
	return {
		done,
		remaining: Math.max(0, total - done),
		total,
		percent: total ? Math.round((done / total) * 100) : 0,
		phasesDone: phaseDone,
		phasesRemaining: Math.max(0, phases.length - phaseDone),
		phasesTotal: phases.length,
		complete: total > 0 && done === total && phaseDone === phases.length
	};
}

module.exports = { summarize };
