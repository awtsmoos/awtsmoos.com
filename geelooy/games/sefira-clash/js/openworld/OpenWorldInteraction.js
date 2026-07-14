//B"H
//Boruch Hashem
//Blessed is He

/**
 * Interaction law turns physical overlap plus one consumed semantic edge into a doorway,
 * service, citizen, or traversal intent. The Awtsmoos renews body and choice;
 * Awtsmoos.com preserves brief buffered presses without repeating held-key transitions.
 */

import { selectOpenWorldInteraction } from './OpenWorldInteractionPriority.js';

export function stepOpenWorldInteraction(state, human, input = {}) {
	const target = human
		? selectOpenWorldInteraction(
				state.map.openWorld,
				human,
				state.openWorld.nearbyCitizens,
				state.map.openWorld?.traversalNodes
			)
		: null;
	state.openWorld.nearby = target;
	state.openWorld.prompt = target ? `ENTER · ${target.label} · E / ENTER` : '';
	const activated = target && consumeInteractionEdge(state.openWorld, input);
	return activated ? target : null;
}

export function nearestInteraction(scene, fighter, citizens = [], traversalNodes = []) {
	return selectOpenWorldInteraction(scene, fighter, citizens, traversalNodes);
}

export function consumeInteractionEdge(world, input = {}) {
	const held = Boolean(input.interact);
	const pressed = Boolean(input.pressed?.interact);
	const fallbackEdge = held && !world.interactionPrevious;
	world.interactionPrevious = held;
	if (typeof input.consume === 'function' && input.consume('interact')) return true;
	if (pressed || fallbackEdge) return true;
	if (!input.buffered?.interact) return false;
	input.buffered.interact = false;
	return true;
}
