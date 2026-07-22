// B"H
// Boruch Hashem
// Blessed is He
/** Even pressure iterations unfold into divergence, alternating Jacobi, and projection passes. */

import { createWebGpuComputePass3d } from "./createWebGpuComputePass3d.js";

export function normalizeWebGpuPressureIterations(value = 8) {
	const iterations = Math.floor(Number(value));
	if (!Number.isFinite(iterations) || iterations <= 0 || iterations % 2 !== 0) {
		throw new TypeError("WebGPU pressure iterations must be a positive even integer.");
	}
	return iterations;
}

function pass(id, entryPoint, bindings, input) {
	return createWebGpuComputePass3d({
		id,
		shaderName: "awtsmoos-liquid-core",
		entryPoint,
		elementCount: input.gridCellCount,
		workgroupSize: input.workgroupSize,
		bindings,
		enabled: input.enabledPasses?.includes(id) ?? true
	});
}

export function createWebGpuPressurePasses3d(input) {
	const iterations = normalizeWebGpuPressureIterations(input.pressureIterations);
	const shared = [
		"uniforms",
		"grid-velocities",
		"divergence",
		"pressure-a",
		"pressure-b"
	];
	const passes = [pass(
		"compute-divergence",
		"compute_divergence",
		shared,
		input
	)];
	for (let iteration = 0; iteration < iterations; iteration += 1) {
		passes.push(pass(
			`pressure-jacobi-${iteration}`,
			iteration % 2 === 0 ? "jacobi_pressure_a" : "jacobi_pressure_b",
			shared,
			input
		));
	}
	passes.push(pass(
		"project-grid-velocity",
		"project_grid_velocity",
		["uniforms", "grid-velocities", "pressure-a"],
		input
	));
	return Object.freeze({
		pressureIterations: iterations,
		passes: Object.freeze(passes)
	});
}
