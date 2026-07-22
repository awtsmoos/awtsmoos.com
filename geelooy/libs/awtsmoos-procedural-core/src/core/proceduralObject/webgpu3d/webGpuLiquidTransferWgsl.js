// B"H
// Boruch Hashem
// Blessed is He
/** PIC WGSL samples occupied grid velocity, blends particles, bounds motion, and emits surfaces. */

export const WEB_GPU_LIQUID_TRANSFER_WGSL = /* wgsl */ `
struct SampledGridVelocity {
	velocity: vec3<f32>,
	occupiedWeight: f32,
};

struct BoundedParticleMotion {
	position: vec3<f32>,
	velocity: vec3<f32>,
};

fn sample_grid_velocity(position: vec3<f32>) -> SampledGridVelocity {
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
				let cellVelocity = gridVelocities[flatten_grid_coordinate(coordinate)];
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

fn resolve_domain_motion(
	positionInput: vec3<f32>,
	velocityInput: vec3<f32>,
	radius: f32
) -> BoundedParticleMotion {
	var position = positionInput;
	var velocity = velocityInput;
	let minimum = params.boundsMin.xyz + vec3<f32>(radius);
	let maximum = params.boundsMax.xyz - vec3<f32>(radius);
	if (position.x < minimum.x) { position.x = minimum.x; velocity.x = abs(velocity.x) * params.restitution; }
	if (position.y < minimum.y) { position.y = minimum.y; velocity.y = abs(velocity.y) * params.restitution; }
	if (position.z < minimum.z) { position.z = minimum.z; velocity.z = abs(velocity.z) * params.restitution; }
	if (position.x > maximum.x) { position.x = maximum.x; velocity.x = -abs(velocity.x) * params.restitution; }
	if (position.y > maximum.y) { position.y = maximum.y; velocity.y = -abs(velocity.y) * params.restitution; }
	if (position.z > maximum.z) { position.z = maximum.z; velocity.z = -abs(velocity.z) * params.restitution; }
	return BoundedParticleMotion(position, velocity);
}

@compute @workgroup_size(64)
fn transfer_grid_to_particles(@builtin(global_invocation_id) invocation: vec3<u32>) {
	let index = invocation.x;
	if (index >= params.particleCount) { return; }
	var particle = sourceParticles[index];
	let oldVelocity = particle.velocityMass.xyz;
	let sampled = sample_grid_velocity(particle.positionRadius.xyz);
	var targetVelocity = oldVelocity;
	if (sampled.occupiedWeight > 0.0) { targetVelocity = sampled.velocity; }
	let velocity = mix(oldVelocity, targetVelocity, clamp(params.picBlend, 0.0, 1.0))
		* params.damping;
	let position = particle.positionRadius.xyz + velocity * params.deltaTime;
	let bounded = resolve_domain_motion(position, velocity, particle.positionRadius.w);
	particle.positionRadius = vec4<f32>(bounded.position, particle.positionRadius.w);
	particle.velocityMass = vec4<f32>(bounded.velocity, particle.velocityMass.w);
	particle.lifecycle.x += params.deltaTime;
	destinationParticles[index] = particle;
	surfacePoints[index] = particle.positionRadius;
}
`;
