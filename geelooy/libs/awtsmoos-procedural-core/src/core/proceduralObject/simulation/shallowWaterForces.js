// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets rain descend and springs emerge without hiding energy in an unrelated scene effect.
 * Awtsmoos.com expresses every source as measurable water and momentum so gameplay can sample the same effect.
 */

function sourceInfluence(source, worldX, worldY) {
	const radius = Math.max(1e-9, Number(source.radius ?? 0));
	const distance = Math.hypot(worldX - Number(source.x ?? 0), worldY - Number(source.y ?? 0));
	return Math.max(0, 1 - distance / radius);
}

function addSource(arrays, index, source, influence, deltaTime) {
	const previousDepth = Math.max(0, arrays.height[index]);
	const depthDelta = Number(source.rate ?? 0) * influence * deltaTime;
	const nextDepth = Math.max(0, previousDepth + depthDelta);
	if (depthDelta > 0 && nextDepth > 0) {
		const previousMomentumX = previousDepth * arrays.velocityX[index];
		const previousMomentumY = previousDepth * arrays.velocityY[index];
		arrays.velocityX[index] = (
			previousMomentumX + depthDelta * Number(source.velocityX ?? 0)
		) / nextDepth;
		arrays.velocityY[index] = (
			previousMomentumY + depthDelta * Number(source.velocityY ?? 0)
		) / nextDepth;
	}
	arrays.height[index] = nextDepth;
	if (nextDepth <= 0) {
		arrays.velocityX[index] = 0;
		arrays.velocityY[index] = 0;
	}
}

/** Applies global rain and local source/sink impulses to mutable solver arrays. */
export function applyShallowWaterForces(state, arrays, deltaTime, options = {}) {
	const sources = options.sources ?? state.sources ?? [];
	const rainRate = Number(options.rainRate ?? state.rainRate ?? 0);
	const width = state.height.width;
	for (let y = 0; y < state.height.height; y += 1) {
		for (let x = 0; x < width; x += 1) {
			const index = y * width + x;
			if (Number(state.obstacles?.values?.[index] ?? 0) >= 0.5) continue;
			arrays.height[index] = Math.max(0, arrays.height[index] + rainRate * deltaTime);
			const worldX = x * state.height.cellSize;
			const worldY = y * state.height.cellSize;
			for (const source of sources) {
				const influence = sourceInfluence(source, worldX, worldY);
				if (influence > 0) addSource(arrays, index, source, influence, deltaTime);
			}
		}
	}
	return arrays;
}
