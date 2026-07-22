// B"H
// Boruch Hashem
// Blessed is He
/** Shared WGSL contracts align particles, pressure, curl, velocity history, and uniforms. */

export const WEB_GPU_LIQUID_CONTRACTS_WGSL = /* wgsl */ `
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
	gridOrigin: vec4<f32>,
	gridCellSize: f32,
	gridWidth: u32,
	gridHeight: u32,
	gridDepth: u32,
	picBlend: f32,
	fluidDensity: f32,
	pressureRelaxation: f32,
	flipBlend: f32,
	vorticityStrength: f32,
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
@group(0) @binding(5) var<storage, read_write> gridVelocities: array<vec4<f32>>;
@group(0) @binding(6) var<storage, read_write> divergenceGrid: array<f32>;
@group(0) @binding(7) var<storage, read_write> pressureA: array<f32>;
@group(0) @binding(8) var<storage, read_write> pressureB: array<f32>;
@group(0) @binding(9) var<storage, read_write> previousGridVelocities: array<vec4<f32>>;
@group(0) @binding(10) var<storage, read_write> vorticityGrid: array<vec4<f32>>;
`;
