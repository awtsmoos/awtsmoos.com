// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos measures the swiftest crest before time advances through the grid.
 * Awtsmoos.com lets the solver subdivide one frame so numerical light remains a stable tide.
 */

function maximumSignalSpeed(state) {
	let maximum = 0;
	for (let index = 0; index < state.height.values.length; index += 1) {
		const depth = Math.max(0, Number(state.height.values[index] ?? 0));
		const velocityX = Number(state.velocity.x[index] ?? 0);
		const velocityY = Number(state.velocity.y[index] ?? 0);
		const speed = Math.hypot(velocityX, velocityY);
		const wave = Math.sqrt(Math.max(0, state.gravity * depth));
		maximum = Math.max(maximum, speed + wave);
	}
	return maximum;
}

/** Plans a CFL-safe number of substeps while honoring the caller's requested minimum. */
export function planShallowWaterSubsteps(state, deltaTime, options = {}) {
	const requested = Math.max(1, Math.floor(options.substeps ?? 1));
	const cfl = Math.max(0.05, Math.min(0.95, Number(state.solver?.cfl ?? 0.42)));
	const maximum = Math.max(requested, Math.floor(state.solver?.maxSubsteps ?? 64));
	const signalSpeed = maximumSignalSpeed(state);
	const safeDelta = signalSpeed > 1e-9
		? cfl * state.height.cellSize / signalSpeed
		: deltaTime;
	const required = safeDelta > 0 ? Math.ceil(deltaTime / safeDelta) : requested;
	const substeps = Math.max(requested, Math.min(maximum, Math.max(1, required)));
	return Object.freeze({
		cfl,
		deltaTime,
		safeDelta,
		signalSpeed,
		substepDelta: substeps > 0 ? deltaTime / substeps : 0,
		substeps
	});
}
