//B"H
//Boruch Hashem
//Blessed be He

/**
 * Production conformance gates. A platform claim is earned by executable suites,
 * not demos. External suites are named here without pretending they have run.
 */
const CONFORMANCE_GATES = Object.freeze([
	gate('container', 'Merkava canonical container suite', 1),
	gate('html-dom', 'Web Platform Tests: HTML + DOM', 1),
	gate('css', 'Web Platform Tests: CSS', 1),
	gate('ecmascript', 'Test262 ECMAScript', 1),
	gate('webgl1', 'Khronos WebGL 1 conformance', 1),
	gate('webgl2', 'Khronos WebGL 2 conformance', 1),
	gate('render-parity', 'Merkava differential render parity', 1),
	gate('security', 'Merkava malformed-input + sandbox suite', 1),
	gate('packaging', 'Merkava five-target packaging suite', 1)
]);

/**
 * Evaluates observed test counts against immutable release thresholds.
 * Missing suites are failures rather than silently disappearing from dashboards.
 * @param {Record<string,{passed:number,total:number}>} results Observed suite counts.
 * @returns {{ok:boolean,gates:Array<object>,failed:string[]}} Release decision.
 */
function evaluateConformance(results = {}) {
	const gates = CONFORMANCE_GATES.map(requirement => {
		const observed = results[requirement.id] || {};
		const passed = Number(observed.passed || 0);
		const total = Number(observed.total || 0);
		const ratio = total > 0 ? passed / total : 0;
		return Object.freeze({
			...requirement,
			passed,
			ratio,
			total,
			ok: total > 0 && ratio >= requirement.minimumRatio
		});
	});
	const failed = gates.filter(item => !item.ok).map(item => item.id);
	return {
		failed,
		gates,
		ok: failed.length === 0
	};
}

/** @returns {object} */
function gate(id, label, minimumRatio) {
	return Object.freeze({
		id,
		label,
		minimumRatio
	});
}

module.exports = {
	CONFORMANCE_GATES,
	evaluateConformance
};
