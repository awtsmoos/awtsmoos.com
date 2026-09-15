//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module TorahRouteTrace
 * @description The Awtsmoos lets Awtsmoos.com name each cold-reader vessel without changing ordinary output or exposing hidden state.
 */

/** Returns whether explicit Torah cold-path timing is enabled for this process. */
function traceEnabled() {
	return process.env.AWTSMOOS_TORAH_TRACE === '1';
}

/** Formats a bounded route identity for one timing line. */
function contextText(context = {}) {
	return Object.entries(context)
		.filter(([, value]) => value !== undefined && value !== null && value !== '')
		.map(([key, value]) => `${key}=${String(value).slice(0, 180)}`)
		.join(' ');
}

/** Emits one bounded cold-path timing event only when explicitly enabled. */
function emit(stage, phase, elapsedMs, context) {
	if (!traceEnabled()) return;
	const detail = contextText(context);
	console.error(`[Torah route trace] ${phase} ${stage} ${elapsedMs}ms${detail ? ` ${detail}` : ''}`);
}

/** Measures one async stage without changing its result or error behavior. */
async function traceAsync(stage, task, context = {}) {
	if (!traceEnabled()) return task();
	const startedAt = Date.now();
	emit(stage, 'start', 0, context);
	try {
		const result = await task();
		emit(stage, 'finish', Date.now() - startedAt, context);
		return result;
	} catch (error) {
		emit(stage, 'error', Date.now() - startedAt, { ...context, error: error?.message || error });
		throw error;
	}
}

module.exports = {
	contextText,
	traceAsync,
	traceEnabled
};
