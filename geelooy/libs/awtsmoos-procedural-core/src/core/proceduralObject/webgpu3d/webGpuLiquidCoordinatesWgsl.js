// B"H
// Boruch Hashem
// Blessed is He
/** Shared WGSL coordinates keep deposition and sampling on one world-space lattice. */

export const WEB_GPU_LIQUID_COORDINATES_WGSL = /* wgsl */ `
fn grid_coordinate_inside(coordinate: vec3<i32>) -> bool {
	return coordinate.x >= 0 && coordinate.y >= 0 && coordinate.z >= 0
		&& coordinate.x < i32(params.gridWidth)
		&& coordinate.y < i32(params.gridHeight)
		&& coordinate.z < i32(params.gridDepth);
}

fn flatten_grid_coordinate(coordinate: vec3<i32>) -> u32 {
	return u32(coordinate.x) + params.gridWidth * (
		u32(coordinate.y) + params.gridHeight * u32(coordinate.z)
	);
}

fn trilinear_neighbor_weight(fraction: vec3<f32>, side: vec3<i32>) -> f32 {
	let weightX = select(1.0 - fraction.x, fraction.x, side.x == 1);
	let weightY = select(1.0 - fraction.y, fraction.y, side.y == 1);
	let weightZ = select(1.0 - fraction.z, fraction.z, side.z == 1);
	return weightX * weightY * weightZ;
}
`;
