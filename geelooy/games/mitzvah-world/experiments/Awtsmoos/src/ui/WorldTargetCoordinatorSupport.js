// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldTargetCoordinatorSupport.js
 * @description Builds pointer handlers, population lists, candidate ordering, and event ownership.
 * The Awtsmoos arranges many small motions beneath one chosen target; Awtsmoos.com keeps wiring
 * outside the coordinator so study and interaction remain readable, testable, and free to shine.
 */

export function createWorldTargetHandlers(owner) {
	return Object.freeze({
		pointercancel: event => owner.cancelPointer(event),
		pointerdown: event => owner.beginPointer(event),
		pointermove: event => owner.movePointer(event),
		pointerup: event => owner.finishPointer(event)
	});
}

export function resolveWorldTargetPopulations(options) {
	const supplied = Array.isArray(options.populations) ? options.populations : [];
	return [...new Set([
		...supplied,
		options.friendlyNpcs,
		options.hostileNpcs
	].filter(Boolean))];
}

export function canOwnWorldTargetPointer(canvas, adapters) {
	return typeof canvas?.addEventListener === 'function'
		&& adapters.length > 0
		&& adapters.every(adapter => adapter.compatible);
}

export function compareWorldTargetCandidates(first, second) {
	return first.distance - second.distance
		|| first.adapter.order - second.adapter.order;
}

export function stopWorldTargetPointerEvent(event) {
	event.preventDefault?.();
	event.stopPropagation?.();
	event.stopImmediatePropagation?.();
}
