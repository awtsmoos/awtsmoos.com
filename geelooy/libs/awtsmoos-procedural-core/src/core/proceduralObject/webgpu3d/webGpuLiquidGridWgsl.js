// B"H
// Boruch Hashem
// Blessed is He
/** Grid WGSL clears atomics, applies force, and reveals normalized floating velocity. */

export const WEB_GPU_LIQUID_GRID_WGSL = /* wgsl */ `
@compute @workgroup_size(64)
fn clear_grid(@builtin(global_invocation_id) invocation: vec3<u32>) {
	let index = invocation.x;
	if (index >= params.gridCellCount) { return; }
	atomicStore(&gridCells[index].mass, 0);
	atomicStore(&gridCells[index].momentumX, 0);
	atomicStore(&gridCells[index].momentumY, 0);
	atomicStore(&gridCells[index].momentumZ, 0);
}

@compute @workgroup_size(64)
fn apply_grid_forces(@builtin(global_invocation_id) invocation: vec3<u32>) {
	let index = invocation.x;
	if (index >= params.gridCellCount) { return; }
	let mass = atomicLoad(&gridCells[index].mass);
	if (mass <= 0) { return; }
	let scaledMass = f32(mass) * params.deltaTime;
	atomicAdd(&gridCells[index].momentumX, i32(round(scaledMass * params.gravity.x)));
	atomicAdd(&gridCells[index].momentumY, i32(round(scaledMass * params.gravity.y)));
	atomicAdd(&gridCells[index].momentumZ, i32(round(scaledMass * params.gravity.z)));
}

@compute @workgroup_size(64)
fn normalize_grid(@builtin(global_invocation_id) invocation: vec3<u32>) {
	let index = invocation.x;
	if (index >= params.gridCellCount) { return; }
	let mass = atomicLoad(&gridCells[index].mass);
	if (mass <= 0) {
		gridVelocities[index] = vec4<f32>(0.0);
		return;
	}
	let momentum = vec3<f32>(
		f32(atomicLoad(&gridCells[index].momentumX)),
		f32(atomicLoad(&gridCells[index].momentumY)),
		f32(atomicLoad(&gridCells[index].momentumZ))
	);
	gridVelocities[index] = vec4<f32>(
		momentum / f32(mass),
		f32(mass) / params.fixedPointScale
	);
}
`;
