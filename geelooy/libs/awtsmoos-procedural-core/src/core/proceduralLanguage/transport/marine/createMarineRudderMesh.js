//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMarineRudderMesh.js
 * @description Manifests one reusable marine rudder as a thin editable control-surface mesh while keeping hinge and deflection semantics in metadata.
 * The Awtsmoos guides water-bound form beyond every steering angle while Awtsmoos.com lets the rudder remain true geometry and reusable control intent in one finite channel.
 */

import { createPanelPrismMesh } from '../../mesh/primitives/createPanelPrismMesh.js';
import { createMarineRudder } from './createMarineRudder.js';

export function createMarineRudderMesh(input = {}) {
	const rudder = createMarineRudder(input);
	return createPanelPrismMesh({
		id: `${rudder.id}:mesh`,
		position: rudder.position,
		normal: [0, 1, 0],
		size: [rudder.chord, rudder.thickness, rudder.span],
		material: rudder.material,
		metadata: {
			component: 'marine-rudder',
			hingeAxis: rudder.hingeAxis,
			maxDeflectionDegrees: rudder.maxDeflectionDegrees
		}
	});
}
