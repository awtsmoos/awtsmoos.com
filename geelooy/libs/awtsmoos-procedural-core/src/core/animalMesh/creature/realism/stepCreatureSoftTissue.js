// B"H
// Boruch Hashem
// Blessed is He
/** Muscle, inertia, drag, and volume constraints reveal one bounded tissue frame. */
function vector(input = [0, 0, 0]) {
	return [Number(input[0] ?? 0), Number(input[1] ?? 0), Number(input[2] ?? 0)];
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

/** Advances shape-matching soft tissue with activation and environmental forces. */
export function stepCreatureSoftTissue(state, input = {}) {
	const deltaTime = Math.max(0, Number(input.deltaTime ?? 1 / 60));
	const external = vector(input.externalAcceleration ?? [0, -0.4, 0]);
	const airflow = vector(input.airflow ?? [0, 0, 0]);
	const activations = input.activations ?? {};
	let maximumDisplacement = 0;
	let maximumVolumeError = 0;
	const regions = state.regions.map(region => {
		const activation = clamp(Number(activations[region.regionId] ?? activations[region.role] ?? region.activation), 0, 1);
		const wetness = clamp(Number(input.wetness?.[region.regionId] ?? input.wetness ?? region.wetness), 0, 1);
		const temperature = Number(input.temperature?.[region.regionId] ?? input.temperature ?? region.temperature);
		const pressure = Math.max(0.01, Number(input.pressure?.[region.regionId] ?? input.pressure ?? region.pressure));
		const drag = Number(input.drag ?? 0.18) * (1 + wetness * 0.65);
		const effectiveStiffness = region.stiffness * (1 + activation * 0.7) * (1 - wetness * 0.15);
		const target = [
			activation * Number(input.muscleBulgeDirection?.[0] ?? 0),
			activation * Number(input.muscleBulgeDirection?.[1] ?? 0.02),
			activation * Number(input.muscleBulgeDirection?.[2] ?? 0)
		];
		const velocity = [...region.velocity];
		for (let axis = 0; axis < 3; axis += 1) {
			const spring = (target[axis] - region.offset[axis]) * effectiveStiffness;
			const damping = -velocity[axis] * (region.damping + drag);
			const wind = (airflow[axis] - velocity[axis]) * drag;
			velocity[axis] += (spring + damping + wind + external[axis]) * deltaTime;
		}
		const offset = region.offset.map((value, axis) => value + velocity[axis] * deltaTime);
		const bulgeTarget = 1 + activation * Number(input.bulgeScale ?? 0.12);
		const pressureTarget = 1 + (pressure - 1) * Number(input.pressureCompliance ?? 0.04);
		const targetVolume = bulgeTarget * pressureTarget;
		const volumeScale = region.volumeScale + (targetVolume - region.volumeScale)
			* region.volumePreservation * deltaTime * Number(input.volumeSolveRate ?? 8);
		maximumDisplacement = Math.max(maximumDisplacement, Math.hypot(...offset));
		maximumVolumeError = Math.max(maximumVolumeError, Math.abs(targetVolume - volumeScale));
		return Object.freeze({
			...region,
			offset: Object.freeze(offset),
			velocity: Object.freeze(velocity),
			volumeScale,
			activation,
			wetness,
			temperature,
			pressure
		});
	});
	return Object.freeze({
		state: Object.freeze({
			...state,
			tick: state.tick + 1,
			time: state.time + deltaTime,
			regions: Object.freeze(regions)
		}),
		report: Object.freeze({
			regionCount: regions.length,
			maximumDisplacement,
			maximumVolumeError,
			averageActivation: regions.reduce((sum, region) => sum + region.activation, 0) / Math.max(1, regions.length),
			averageWetness: regions.reduce((sum, region) => sum + region.wetness, 0) / Math.max(1, regions.length)
		})
	});
}
