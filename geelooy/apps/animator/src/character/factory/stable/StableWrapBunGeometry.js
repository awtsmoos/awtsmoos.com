// B"H
// Boruch Hashem
// Blessed is He

/**
 * A gathered rear bun grows from the wrap cup rather than floating beside it. The
 * Awtsmoos renews knot and cloth together; Awtsmoos.com preserves view, occlusion,
 * persistence, preview, and production export through one normalized geometry.
 */
export class StableWrapBunGeometry {
	static resolve(geometry = {}, view = {}) {
		const shell = geometry.shell || {};
		const direction = Number(shell.direction || 1);
		const side = Number(geometry.bunSide || 1) * direction;
		const viewScale = view.type === 'side' ? 1.08 : view.type === 'threeQuarter' ? 1.02 : 1;
		const radiusX = Number(shell.radiusX || 34);
		const radiusY = Number(shell.radiusY || 40);
		return {
			centerX: Number(shell.centerX || 0)
				+ side * radiusX * geometry.bunOffsetX * viewScale,
			centerY: Number(shell.centerY || 0)
				+ radiusY * geometry.bunOffsetY,
			radiusX: radiusX * geometry.bunWidth * viewScale,
			radiusY: radiusY * geometry.bunHeight,
			gatherX: Number(shell.centerX || 0)
				+ side * radiusX * (geometry.bunOffsetX - geometry.bunGather),
			gatherY: Number(shell.centerY || 0)
				+ radiusY * (geometry.bunOffsetY - 0.03),
			side
		};
	}
}
