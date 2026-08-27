// B"H
// Boruch Hashem
// Blessed is He
/** Compatibility WGSL preserves independent integration and surface packing entry points. */

export const WEB_GPU_LIQUID_OUTPUT_WGSL = /* wgsl */ `
@compute @workgroup_size(64)
fn integrate_particles(@builtin(global_invocation_id) invocation: vec3<u32>) {
	let index = invocation.x;
	if (index >= params.particleCount) { return; }
	var particle = sourceParticles[index];
	let velocity = (particle.velocityMass.xyz + params.gravity.xyz * params.deltaTime)
		* params.damping;
	let position = particle.positionRadius.xyz + velocity * params.deltaTime;
	let bounded = resolve_domain_motion(position, velocity, particle.positionRadius.w);
	particle.positionRadius = vec4<f32>(bounded.position, particle.positionRadius.w);
	particle.velocityMass = vec4<f32>(bounded.velocity, particle.velocityMass.w);
	particle.lifecycle.x += params.deltaTime;
	destinationParticles[index] = particle;
}

@compute @workgroup_size(64)
fn pack_surface_points(@builtin(global_invocation_id) invocation: vec3<u32>) {
	let index = invocation.x;
	if (index >= params.particleCount) { return; }
	surfacePoints[index] = sourceParticles[index].positionRadius;
}
`;
