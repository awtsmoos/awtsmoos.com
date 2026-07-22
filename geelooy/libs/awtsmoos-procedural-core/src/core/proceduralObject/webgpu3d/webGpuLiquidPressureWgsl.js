// B"H
// Boruch Hashem
// Blessed is He
/** Two Jacobi WGSL entries alternate immutable pressure sources across bounded iterations. */

export const WEB_GPU_LIQUID_PRESSURE_WGSL = /* wgsl */ `
fn pressure_a_neighbor(coordinate: vec3<i32>, center: f32) -> f32 {
	if (!grid_coordinate_inside(coordinate)) { return center; }
	let index = flatten_grid_coordinate(coordinate);
	if (gridVelocities[index].w <= 0.0) { return 0.0; }
	return pressureA[index];
}

fn pressure_b_neighbor(coordinate: vec3<i32>, center: f32) -> f32 {
	if (!grid_coordinate_inside(coordinate)) { return center; }
	let index = flatten_grid_coordinate(coordinate);
	if (gridVelocities[index].w <= 0.0) { return 0.0; }
	return pressureB[index];
}

@compute @workgroup_size(64)
fn jacobi_pressure_a(@builtin(global_invocation_id) invocation: vec3<u32>) {
	let index = invocation.x;
	if (index >= params.gridCellCount) { return; }
	if (gridVelocities[index].w <= 0.0) { pressureB[index] = 0.0; return; }
	let coordinate = unflatten_grid_index(index);
	let center = pressureA[index];
	let sum = pressure_a_neighbor(coordinate + vec3<i32>(-1, 0, 0), center)
		+ pressure_a_neighbor(coordinate + vec3<i32>(1, 0, 0), center)
		+ pressure_a_neighbor(coordinate + vec3<i32>(0, -1, 0), center)
		+ pressure_a_neighbor(coordinate + vec3<i32>(0, 1, 0), center)
		+ pressure_a_neighbor(coordinate + vec3<i32>(0, 0, -1), center)
		+ pressure_a_neighbor(coordinate + vec3<i32>(0, 0, 1), center);
	let safeDeltaTime = max(params.deltaTime, 0.000001);
	let scale = params.gridCellSize * params.gridCellSize
		* params.fluidDensity / safeDeltaTime;
	let candidate = (sum - divergenceGrid[index] * scale) / 6.0;
	pressureB[index] = mix(center, candidate, params.pressureRelaxation);
}

@compute @workgroup_size(64)
fn jacobi_pressure_b(@builtin(global_invocation_id) invocation: vec3<u32>) {
	let index = invocation.x;
	if (index >= params.gridCellCount) { return; }
	if (gridVelocities[index].w <= 0.0) { pressureA[index] = 0.0; return; }
	let coordinate = unflatten_grid_index(index);
	let center = pressureB[index];
	let sum = pressure_b_neighbor(coordinate + vec3<i32>(-1, 0, 0), center)
		+ pressure_b_neighbor(coordinate + vec3<i32>(1, 0, 0), center)
		+ pressure_b_neighbor(coordinate + vec3<i32>(0, -1, 0), center)
		+ pressure_b_neighbor(coordinate + vec3<i32>(0, 1, 0), center)
		+ pressure_b_neighbor(coordinate + vec3<i32>(0, 0, -1), center)
		+ pressure_b_neighbor(coordinate + vec3<i32>(0, 0, 1), center);
	let safeDeltaTime = max(params.deltaTime, 0.000001);
	let scale = params.gridCellSize * params.gridCellSize
		* params.fluidDensity / safeDeltaTime;
	let candidate = (sum - divergenceGrid[index] * scale) / 6.0;
	pressureA[index] = mix(center, candidate, params.pressureRelaxation);
}
`;
