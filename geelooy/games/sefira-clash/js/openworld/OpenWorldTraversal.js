//B"H
//Boruch Hashem
//Blessed is He

/**
 * Traversal law resolves one physical node edge, moves the traveler only for authored
 * ladder or lift destinations, and emits unique patrol or clue evidence once. The Awtsmoos
 * renews path and witness; Awtsmoos.com prevents held-key farming and global teleportation.
 */

import { pushOpenWorldDomainEvent } from './OpenWorldState.js';

export function performOpenWorldTraversal(state, node) {
	if (!node?.id) return { changed: false, reason: 'UNKNOWN_TRAVERSAL' };
	const used = state.openWorld.usedTraversalNodes;
	const firstUse = !used.has(node.id);
	used.add(node.id);
	if (node.destination) moveTraveler(state, node.destination);
	if (firstUse) {
		pushOpenWorldDomainEvent(state, {
			type: node.eventType,
			targetId: node.targetId,
			nodeId: node.id,
			count: 1
		});
	}
	state.openWorld.toast = firstUse
		? `${node.label} recorded.`
		: `${node.label} already recorded.`;
	return { changed: firstUse || Boolean(node.destination), firstUse };
}

function moveTraveler(state, destination) {
	const human = state.fighters.find(fighter => fighter.human);
	if (!human) return;
	human.x = destination.x;
	human.y = destination.y;
	human.prevY = destination.y;
	human.vx = 0;
	human.vy = 0;
}
