// B"H
// Boruch Hashem
// Blessed is He
/** Deposition WGSL atomically offers trilinear particle mass and momentum to the grid. */

export const WEB_GPU_LIQUID_DEPOSIT_WGSL = /* wgsl */ `
@compute @workgroup_size(64)
fn deposit_particles(@builtin(global_invocation_id) invocation: vec3<u32>) {
	let index = invocation.x;
	if (index >= params.particleCount) { return; }
	let particle = sourceParticles[index];
	let gridPosition = (particle.positionRadius.xyz - params.gridOrigin.xyz)
		/ params.gridCellSize;
	let base = vec3<i32>(floor(gridPosition));
	let fraction = fract(gridPosition);
	for (var z: i32 = 0; z < 2; z += 1) {
		for (var y: i32 = 0; y < 2; y += 1) {
			for (var x: i32 = 0; x < 2; x += 1) {
				let side = vec3<i32>(x, y, z);
				let coordinate = base + side;
				if (!grid_coordinate_inside(coordinate)) { continue; }
				let weight = trilinear_neighbor_weight(fraction, side);
				let mass = particle.velocityMass.w;
				let scale = params.fixedPointScale;
				let cell = flatten_grid_coordinate(coordinate);
				atomicAdd(&gridCells[cell].mass, i32(round(mass * weight * scale)));
				atomicAdd(&gridCells[cell].momentumX, i32(round(
					mass * particle.velocityMass.x * weight * scale
				)));
				atomicAdd(&gridCells[cell].momentumY, i32(round(
					mass * particle.velocityMass.y * weight * scale
				)));
				atomicAdd(&gridCells[cell].momentumZ, i32(round(
					mass * particle.velocityMass.z * weight * scale
				)));
			}
		}
	}
}
`;
