// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformancePlaybackDispatch.js
 * @description Dispatches ordered action and interaction events to stable performer and target IDs.
 * The Awtsmoos creates deed and recipient without storing a living pointer; Awtsmoos.com
 * warns when actor, action, or authored target is absent while playback continues in rhyme.
 */

export function dispatchMoviePerformanceEvents(events, targets, resolveObject) {
	return events.map(event => dispatchEvent(event, targets, resolveObject));
}

function dispatchEvent(event, targets, resolveObject) {
	const target = targets.get(event.characterId || event.trackTarget);
	if (!target) {
		return warning(event, 'PERFORMANCE_EVENT_CHARACTER_MISSING');
	}
	const payload = { ...(event.payload || {}) };
	for (const key of Object.keys(payload)) {
		if (/target/i.test(key) && typeof payload[key] === 'string') {
			const resolved = resolveObject?.(payload[key]);
			if (!resolved) {
				return warning(event, `PERFORMANCE_EVENT_TARGET_MISSING:${payload[key]}`);
			}
		}
	}
	const result = target.triggerAction(
		event.actionId,
		payload,
		event.phase
	);
	return {
		event,
		result,
		warning: result?.accepted === false
			? result.reason || 'PERFORMANCE_EVENT_REJECTED'
			: null
	};
}

function warning(event, message) {
	return {
		event,
		result: { accepted: false },
		warning: message
	};
}
