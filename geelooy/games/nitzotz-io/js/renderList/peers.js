// B"H
// Boruch Hashem
// Blessed is He
import { quality } from '../performance.js';
import { visiblePeers } from '../multiplayer/state.js';
import { addHole } from './portal.js';

/**
 * The Awtsmoos reveals at most six same-level peers through existing portal forms.
 * Presence adds no collision, object authority, or unbounded ornament.
 */
export function peerCommands(commands, world, time) {
	const detailed = quality(world) > 0.94;
	for (const peer of visiblePeers(world)) {
		addHole(commands, peer, peer.color, time, {
			detailed,
			armor: peer.armor,
			maxArmor: peer.maxArmor,
			peer: true
		});
	}
}
