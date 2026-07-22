// B"H
// Boruch Hashem
// Blessed is He
/** Vorticity WGSL measures curl and restores bounded rotational motion after projection. */

export const WEB_GPU_LIQUID_VORTICITY_WGSL = /* wgsl */ `
fn velocity_component_at(
	coordinate: vec3<i32>,
	axis: u32,
	outsideValue: f32
) -> f32 {
	if (!grid_coordinate_inside(coordinate)) { return outsideValue; }
	let value = gridVelocities[flatten_grid_coordinate(coordinate)];
	if (value.w <= 0.0) { return 0.0; }
	return value[axis];
}

fn vorticity_magnitude_at(coordinate: vec3<i32>, outsideValue: f32) -> f32 {
	if (!grid_coordinate_inside(coordinate)) { return outsideValue; }
	return vorticityGrid[flatten_grid_coordinate(coordinate)].w;
}

@compute @workgroup_size(64)
fn compute_vorticity(@builtin(global_invocation_id) invocation: vec3<u32>) {
	let index = invocation.x;
	if (index >= params.gridCellCount) { return; }
	let velocity = gridVelocities[index];
	if (velocity.w <= 0.0) {
		vorticityGrid[index] = vec4<f32>(0.0);
		return;
	}
	let coordinate = unflatten_grid_index(index);
	let inverseDoubleCell = 1.0 / (2.0 * params.gridCellSize);
	let dVzDy = (velocity_component_at(coordinate + vec3<i32>(0, 1, 0), 2u, velocity.z)
		- velocity_component_at(coordinate + vec3<i32>(0, -1, 0), 2u, velocity.z))
		* inverseDoubleCell;
	let dVyDz = (velocity_component_at(coordinate + vec3<i32>(0, 0, 1), 1u, velocity.y)
		- velocity_component_at(coordinate + vec3<i32>(0, 0, -1), 1u, velocity.y))
		* inverseDoubleCell;
	let dVxDz = (velocity_component_at(coordinate + vec3<i32>(0, 0, 1), 0u, velocity.x)
		- velocity_component_at(coordinate + vec3<i32>(0, 0, -1), 0u, velocity.x))
		* inverseDoubleCell;
	let dVzDx = (velocity_component_at(coordinate + vec3<i32>(1, 0, 0), 2u, velocity.z)
		- velocity_component_at(coordinate + vec3<i32>(-1, 0, 0), 2u, velocity.z))
		* inverseDoubleCell;
	let dVyDx = (velocity_component_at(coordinate + vec3<i32>(1, 0, 0), 1u, velocity.y)
		- velocity_component_at(coordinate + vec3<i32>(-1, 0, 0), 1u, velocity.y))
		* inverseDoubleCell;
	let dVxDy = (velocity_component_at(coordinate + vec3<i32>(0, 1, 0), 0u, velocity.x)
		- velocity_component_at(coordinate + vec3<i32>(0, -1, 0), 0u, velocity.x))
		* inverseDoubleCell;
	let curl = vec3<f32>(dVzDy - dVyDz, dVxDz - dVzDx, dVyDx - dVxDy);
	vorticityGrid[index] = vec4<f32>(curl, length(curl));
}

@compute @workgroup_size(64)
fn apply_vorticity_confinement(@builtin(global_invocation_id) invocation: vec3<u32>) {
	let index = invocation.x;
	if (index >= params.gridCellCount) { return; }
	var velocity = gridVelocities[index];
	if (velocity.w <= 0.0 || params.vorticityStrength <= 0.0) { return; }
	let coordinate = unflatten_grid_index(index);
	let centerMagnitude = vorticityGrid[index].w;
	let inverseDoubleCell = 1.0 / (2.0 * params.gridCellSize);
	let gradient = vec3<f32>(
		vorticity_magnitude_at(coordinate + vec3<i32>(1, 0, 0), centerMagnitude)
			- vorticity_magnitude_at(coordinate + vec3<i32>(-1, 0, 0), centerMagnitude),
		vorticity_magnitude_at(coordinate + vec3<i32>(0, 1, 0), centerMagnitude)
			- vorticity_magnitude_at(coordinate + vec3<i32>(0, -1, 0), centerMagnitude),
		vorticity_magnitude_at(coordinate + vec3<i32>(0, 0, 1), centerMagnitude)
			- vorticity_magnitude_at(coordinate + vec3<i32>(0, 0, -1), centerMagnitude)
	) * inverseDoubleCell;
	let gradientLength = length(gradient);
	if (gradientLength <= 0.000001) { return; }
	let normal = gradient / gradientLength;
	let force = cross(normal, vorticityGrid[index].xyz)
		* params.vorticityStrength * params.gridCellSize;
	velocity = vec4<f32>(velocity.xyz + force * params.deltaTime, velocity.w);
	gridVelocities[index] = velocity;
}
`;
