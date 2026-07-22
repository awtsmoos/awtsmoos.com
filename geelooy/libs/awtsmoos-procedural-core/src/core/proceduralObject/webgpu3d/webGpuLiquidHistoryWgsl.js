// B"H
// Boruch Hashem
// Blessed is He
/** The projected grid becomes the next frame's FLIP memory after particle transfer. */

export const WEB_GPU_LIQUID_HISTORY_WGSL = /* wgsl */ `
@compute @workgroup_size(64)
fn store_grid_history(@builtin(global_invocation_id) invocation: vec3<u32>) {
	let index = invocation.x;
	if (index >= params.gridCellCount) { return; }
	previousGridVelocities[index] = gridVelocities[index];
}
`;
