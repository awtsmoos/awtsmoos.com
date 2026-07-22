// B"H
// Boruch Hashem
// Blessed is He
/** Divergence WGSL measures occupied compression and clears both pressure vessels. */

export const WEB_GPU_LIQUID_DIVERGENCE_WGSL = /* wgsl */ `
fn occupied_velocity_component(
	coordinate: vec3<i32>,
	axis: u32,
	outsideValue: f32
) -> f32 {
	if (!grid_coordinate_inside(coordinate)) { return outsideValue; }
	let velocity = gridVelocities[flatten_grid_coordinate(coordinate)];
	if (velocity.w <= 0.0) { return 0.0; }
	if (axis == 0u) { return velocity.x; }
	if (axis == 1u) { return velocity.y; }
	return velocity.z;
}

@compute @workgroup_size(64)
fn compute_divergence(@builtin(global_invocation_id) invocation: vec3<u32>) {
	let index = invocation.x;
	if (index >= params.gridCellCount) { return; }
	divergenceGrid[index] = 0.0;
	pressureA[index] = 0.0;
	pressureB[index] = 0.0;
	let centerVelocity = gridVelocities[index];
	if (centerVelocity.w <= 0.0) { return; }
	let coordinate = unflatten_grid_index(index);
	var divergence = 0.0;
	for (var axis: u32 = 0u; axis < 3u; axis += 1u) {
		var negativeOffset = vec3<i32>(0);
		var positiveOffset = vec3<i32>(0);
		negativeOffset[axis] = -1;
		positiveOffset[axis] = 1;
		let center = centerVelocity[axis];
		let negative = occupied_velocity_component(
			coordinate + negativeOffset,
			axis,
			center
		);
		let positive = occupied_velocity_component(
			coordinate + positiveOffset,
			axis,
			center
		);
		divergence += (positive - negative) / (2.0 * params.gridCellSize);
	}
	divergenceGrid[index] = divergence;
}
`;
