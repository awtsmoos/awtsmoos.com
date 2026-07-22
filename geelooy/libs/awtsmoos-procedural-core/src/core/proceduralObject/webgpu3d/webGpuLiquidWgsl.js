// B"H
// Boruch Hashem
// Blessed is He
/** Real WGSL kernels integrate particles, clear fixed-point grids, apply force, and pack surfaces. */

export const WEB_GPU_LIQUID_WGSL = /* wgsl */ `
struct LiquidUniforms {
	deltaTime: f32,
	particleCount: u32,
	gridCellCount: u32,
	frameIndex: u32,
	gravity: vec4<f32>,
	boundsMin: vec4<f32>,
	boundsMax: vec4<f32>,
	damping: f32,
	restitution: f32,
	fixedPointScale: f32,
	padding: f32,
};

struct Particle {
	positionRadius: vec4<f32>,
	velocityMass: vec4<f32>,
	lifecycle: vec4<f32>,
};

struct GridCell {
	mass: atomic<i32>,
	momentumX: atomic<i32>,
	momentumY: atomic<i32>,
	momentumZ: atomic<i32>,
};

@group(0) @binding(0) var<uniform> params: LiquidUniforms;
@group(0) @binding(1) var<storage, read> sourceParticles: array<Particle>;
@group(0) @binding(2) var<storage, read_write> destinationParticles: array<Particle>;
@group(0) @binding(3) var<storage, read_write> gridCells: array<GridCell>;
@group(0) @binding(4) var<storage, read_write> surfacePoints: array<vec4<f32>>;

@compute @workgroup_size(64)
fn integrate_particles(@builtin(global_invocation_id) invocation: vec3<u32>) {
	let index = invocation.x;
	if (index >= params.particleCount) { return; }
	var particle = sourceParticles[index];
	var velocity = (particle.velocityMass.xyz + params.gravity.xyz * params.deltaTime)
		* params.damping;
	var position = particle.positionRadius.xyz + velocity * params.deltaTime;
	let radius = particle.positionRadius.w;
	let minimum = params.boundsMin.xyz + vec3<f32>(radius);
	let maximum = params.boundsMax.xyz - vec3<f32>(radius);
	if (position.x < minimum.x) { position.x = minimum.x; velocity.x = abs(velocity.x) * params.restitution; }
	if (position.y < minimum.y) { position.y = minimum.y; velocity.y = abs(velocity.y) * params.restitution; }
	if (position.z < minimum.z) { position.z = minimum.z; velocity.z = abs(velocity.z) * params.restitution; }
	if (position.x > maximum.x) { position.x = maximum.x; velocity.x = -abs(velocity.x) * params.restitution; }
	if (position.y > maximum.y) { position.y = maximum.y; velocity.y = -abs(velocity.y) * params.restitution; }
	if (position.z > maximum.z) { position.z = maximum.z; velocity.z = -abs(velocity.z) * params.restitution; }
	particle.positionRadius = vec4<f32>(position, radius);
	particle.velocityMass = vec4<f32>(velocity, particle.velocityMass.w);
	particle.lifecycle.x = particle.lifecycle.x + params.deltaTime;
	destinationParticles[index] = particle;
}

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
fn pack_surface_points(@builtin(global_invocation_id) invocation: vec3<u32>) {
	let index = invocation.x;
	if (index >= params.particleCount) { return; }
	surfacePoints[index] = sourceParticles[index].positionRadius;
}
`;

export const WEB_GPU_LIQUID_ENTRY_POINTS = Object.freeze([
	"integrate_particles",
	"clear_grid",
	"apply_grid_forces",
	"pack_surface_points"
]);
