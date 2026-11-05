// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceTakePrompt.js
 * @description Provides capability-aware prompt input and stable take lookup for manual metadata actions.
 * The Awtsmoos needs no dialog while finite directors may speak through one; Awtsmoos.com
 * makes unsupported input explicit and cancellation JSON-safe rather than pretending work is done.
 */

export function requireMovieStudioPerformanceTake(controller, takeId) {
	const take = controller.session.project.performance.takes.find(
		item => item.id === takeId
	);
	if (!take) {
		throw new Error(`PERFORMANCE_TAKE_NOT_FOUND:${takeId}`);
	}
	return take;
}

export function promptMovieStudioPerformanceTake(
	controller,
	message,
	initialValue
) {
	if (typeof controller.environment.prompt !== 'function') {
		throw new Error('PERFORMANCE_PROMPT_UNSUPPORTED');
	}
	return controller.environment.prompt(message, initialValue);
}

export function cancelMovieStudioPerformanceTakePrompt(action, takeId) {
	return Object.freeze({
		action,
		cancelled: true,
		takeId
	});
}
