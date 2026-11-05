// B"H
import { localToWorld } from './HouseSpec.js';

export function stairTraversalPath(layout, spec, lateralOffset, sampleCount = 128) {
	const first = layout.steps[0];
	const last = layout.steps.at(-1);
	const startZ = layout.lowerLanding.centerZ + layout.lowerLanding.depth * 0.28;
	const endZ = last.centerZ - last.depth * 0.28;
	return Array.from({ length: sampleCount + 1 }, (_, index) => {
		const progress = index / sampleCount;
		const localZ = startZ + (endZ - startZ) * progress;
		return localToWorld(
			spec,
			layout.lowerLanding.centerX + lateralOffset,
			localZ
		);
	});
}

export function lateralTraversalOffsets(layout) {
	return [
		-layout.width * 0.28,
		0,
		layout.width * 0.28
	];
}
