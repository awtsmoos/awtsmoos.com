// B"H
// Boruch Hashem
// Blessed is He
/** FLIP WGSL blends stable PIC velocity with projected grid-history deltas. */

export const WEB_GPU_LIQUID_FLIP_TRANSFER_WGSL = /* wgsl */ `
fn sample_previous_grid_velocity(position: vec3<f32>) -> SampledGridVelocity {
	let gridPosition = (position - params.gridOrigin.xyz) / params.gridCellSize;
	let base = vec3<i32>(floor(gridPosition));
	let fraction = fract(gridPosition);
	var velocity = vec3<f32>(0.0);
	var occupiedWeight = 0.0;
	for (var z: i32 = 0; z < 2; z += 1) {
		for (var y: i32 = 0; y < 2; y += 1) {
			for (var x: i32 = 0; x < 2; x += 1) {
				let side = vec3<i32>(x, y, z);
				let coordinate = base + side;
				if (!grid_coordinate_inside(coordinate)) { continue; }
				let cellVelocity = previousGridVelocities[
					flatten_grid_coordinate(coordinate)
				];
				if (cellVelocity.w <= 0.0) { continue; }
				let weight = trilinear_neighbor_weight(fraction, side);
				velocity += cellVelocity.xyz * weight;
				occupiedWeight += weight;
			}
		}
	}
	if (occupiedWeight > 0.0) {
		return SampledGridVelocity(velocity / occupiedWeight, occupiedWeight);
	}
	return SampledGridVelocity(vec3<f32>(0.0), 0.0);
}

@compute @workgroup_size(64)
fn transfer_grid_to_particles_flip(
	@builtin(global_invocation_id) invocation: vec3<u32>
) {
	let index = invocation.x;
	if (index >= params.particleCount) { return; }
	var particle = sourceParticles[index];
	let oldVelocity = particle.velocityMass.xyz;
	let current = sample_grid_velocity(particle.positionRadius.xyz);
	let previous = sample_previous_grid_velocity(particle.positionRadius.xyz);
	var velocity = oldVelocity;
	if (current.occupiedWeight > 0.0) {
		let picVelocity = current.velocity;
		var delta = vec3<f32>(0.0);
		if (previous.occupiedWeight > 0.0) {
			delta = current.velocity - previous.velocity;
		}
		let flipVelocity = oldVelocity + delta;
		velocity = mix(picVelocity, flipVelocity, clamp(params.flipBlend, 0.0, 1.0))
			* params.damping;
	}
	let position = particle.positionRadius.xyz + velocity * params.deltaTime;
	let bounded = resolve_domain_motion(position, velocity, particle.positionRadius.w);
	particle.positionRadius = vec4<f32>(bounded.position, particle.positionRadius.w);
	particle.velocityMass = vec4<f32>(bounded.velocity, particle.velocityMass.w);
	particle.lifecycle.x += params.deltaTime;
	destinationParticles[index] = particle;
	surfacePoints[index] = particle.positionRadius;
}
`;
