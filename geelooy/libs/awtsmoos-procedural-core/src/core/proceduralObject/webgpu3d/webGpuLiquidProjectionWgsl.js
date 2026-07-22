// B"H
// Boruch Hashem
// Blessed is He
/** Projection WGSL subtracts the final even-iteration pressure gradient from velocity. */

export const WEB_GPU_LIQUID_PROJECTION_WGSL = /* wgsl */ `
fn projected_pressure_neighbor(coordinate: vec3<i32>, center: f32) -> f32 {
	if (!grid_coordinate_inside(coordinate)) { return center; }
	let index = flatten_grid_coordinate(coordinate);
	if (gridVelocities[index].w <= 0.0) { return 0.0; }
	return pressureA[index];
}

@compute @workgroup_size(64)
fn project_grid_velocity(@builtin(global_invocation_id) invocation: vec3<u32>) {
	let index = invocation.x;
	if (index >= params.gridCellCount) { return; }
	var velocity = gridVelocities[index];
	if (velocity.w <= 0.0) { return; }
	let coordinate = unflatten_grid_index(index);
	let center = pressureA[index];
	let pressureNegative = vec3<f32>(
		projected_pressure_neighbor(coordinate + vec3<i32>(-1, 0, 0), center),
		projected_pressure_neighbor(coordinate + vec3<i32>(0, -1, 0), center),
		projected_pressure_neighbor(coordinate + vec3<i32>(0, 0, -1), center)
	);
	let pressurePositive = vec3<f32>(
		projected_pressure_neighbor(coordinate + vec3<i32>(1, 0, 0), center),
		projected_pressure_neighbor(coordinate + vec3<i32>(0, 1, 0), center),
		projected_pressure_neighbor(coordinate + vec3<i32>(0, 0, 1), center)
	);
	let gradientScale = params.deltaTime
		/ (2.0 * params.fluidDensity * params.gridCellSize);
	velocity = vec4<f32>(
		velocity.xyz - (pressurePositive - pressureNegative) * gradientScale,
		velocity.w
	);
	gridVelocities[index] = velocity;
}
`;
