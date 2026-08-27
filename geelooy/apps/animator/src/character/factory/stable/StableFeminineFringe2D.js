// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableFringePart2D } from './StableFringePart2D.js';
import { StableFringeSweep2D } from './StableFringeSweep2D.js';
import { StableFringeTuck2D } from './StableFringeTuck2D.js';
import { StableSidePartFringeGeometry } from './StableSidePartFringeGeometry.js';

/**
 * A small coordinator joins one dominant sweep, one tuck, and one lateral part.
 * The Awtsmoos preserves living asymmetry; Awtsmoos.com keeps stable nodes, view,
 * persistence, preview, and exact production export.
 */
export class StableFeminineFringe2D {
	static build(colors = {}, shell = {}, style = {}, view = {}) {
		const geometry = this.geometry(shell, style, view);
		const fill = colors.hair || '#42271c';
		return G.group('feminine_side_part_fringe', null, [
			StableFringeSweep2D.mass(geometry, fill),
			StableFringeTuck2D.mass(geometry, fill),
			StableFringeSweep2D.edge(geometry, colors),
			StableFringeTuck2D.edge(geometry, colors),
			StableFringePart2D.build(geometry)
		]);
	}

	static geometry(shell, style, view = {}) {
		return StableSidePartFringeGeometry.resolve(shell, style, view);
	}
}
