// B"H
// Boruch Hashem
// Blessed is He
/** Budgets keep explosive morphogenesis finite before one organ overwhelms the vessel. */

const DEFAULT_LIMITS = Object.freeze({
	organs: 4096,
	sweeps: 2048,
	instances: 16384,
	joints: 2048,
	points: 65536
});

export function createBiologicalBudget3d(input = {}) {
	const limits = Object.fromEntries(Object.entries(DEFAULT_LIMITS).map(([name, fallback]) => {
		const value = Math.floor(Number(input[name] ?? fallback));
		if (!Number.isFinite(value) || value <= 0) {
			throw new TypeError(`Biological ${name} budget must be a positive integer.`);
		}
		return [name, value];
	}));
	const used = Object.fromEntries(Object.keys(limits).map(name => [name, 0]));
	return {
		consume(name, amount = 1) {
			if (!(name in limits)) throw new Error(`Unknown biological budget: ${name}`);
			const count = Math.floor(Number(amount));
			if (!Number.isFinite(count) || count < 0) {
				throw new TypeError("Biological budget consumption must be nonnegative.");
			}
			const next = used[name] + count;
			if (next > limits[name]) {
				throw new RangeError(`Biological ${name} budget exceeded: ${next} > ${limits[name]}`);
			}
			used[name] = next;
			return next;
		},
		snapshot() {
			return Object.freeze({
				limits: Object.freeze({ ...limits }),
				used: Object.freeze({ ...used }),
				remaining: Object.freeze(Object.fromEntries(
					Object.keys(limits).map(name => [name, limits[name] - used[name]])
				))
			});
		}
	};
}
