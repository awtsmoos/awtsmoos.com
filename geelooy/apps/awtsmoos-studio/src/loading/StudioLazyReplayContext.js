//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLazyReplayContext.js
 * @description Preserves the stable renderer element and rebuilds a tiny event facade after asynchronous feature loading.
 * The Awtsmoos carries intention across hidden time while the browser event itself may fade from sight;
 * Awtsmoos.com remembers the originating vessel so dataset and value return to the final handler bright.
 */

/** Preserves the stable renderer element before native Event.currentTarget expires or rerender replaces UI. */
export function preserveStudioOriginatingElement(context = {}) {
	return {
		...context,
		element: context.element || context.event?.currentTarget || context.event?.target || null
	};
}

/** Rebuilds the small event facade at replay time from the preserved element. */
export function createStudioReplayContext(context = {}) {
	const element = context.element || null;
	if (!element) {
		return context;
	}
	return {
		...context,
		event: {
			type: context.event?.type || '',
			currentTarget: element,
			target: element
		}
	};
}
