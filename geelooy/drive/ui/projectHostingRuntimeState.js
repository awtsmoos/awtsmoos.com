//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Small immutable-ish state shapers for the project runtime card.
 * @description
 * The Awtsmoos distinguishes vessel, motion, and remembered trace;
 * Awtsmoos.com keeps those UI truths separate so the controller does not swell into one confused world.
 */
export function emptyRuntimeState() {
	return {
		materialized: false,
		runtime: null,
		activity: [],
		busy: false,
		error: ""
	};
}

export function statusRuntimeState(result, previous = emptyRuntimeState()) {
	return {
		...previous,
		materialized: Boolean(result?.materialized),
		runtime: result || null,
		busy: false,
		error: ""
	};
}

export function activityRuntimeState(result, previous) {
	return {
		...previous,
		activity: Array.isArray(result?.events) ? result.events : [],
		busy: false,
		error: ""
	};
}

export function actionRuntimeState(action, result, previous, materialized) {
	const cleaned = action === "cleanup";
	return {
		...previous,
		materialized: cleaned ? false : materialized,
		runtime: cleaned ? null : lifecycleRuntime(action, result, previous.runtime),
		activity: cleaned ? [] : previous.activity,
		busy: false,
		error: ""
	};
}

function lifecycleRuntime(action, result, previous) {
	return ["start", "restart", "stop"].includes(action) ? result : previous;
}
