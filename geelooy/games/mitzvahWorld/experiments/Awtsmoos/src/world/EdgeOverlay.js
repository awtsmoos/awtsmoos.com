// B"H
import { Group } from '../../../light-three-gltf/tiny-runtime.js';

/**
 * Preserves the historical edge-overlay hierarchy without drawing cartoon outline bars.
 * Collision remains independent because Terrain3D builds colliders from source definitions
 * before this visual-only group is created.
 *
 * @param {object} definition World primitive definition whose id names the hierarchy node.
 * @returns {Group} Empty compatibility group carrying the suppression decision as metadata.
 */
export function createEdgeOverlay(definition) {
	const group = new Group();
	group.name = `${definition.id}-Awtsmoos-edges-suppressed`;
	group.userData = {
		...(group.userData || {}),
		AwtsmoosEdgeOverlay: {
			enabled: false,
			reason: 'hyper-real-material-lighting-and-draw-call-budget',
			collisionIndependent: true
		}
	};
	return group;
}
