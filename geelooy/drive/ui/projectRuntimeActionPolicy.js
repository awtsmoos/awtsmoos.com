//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Pure lifecycle-action policy for the trusted project runtime card.
 * @description
 * The Awtsmoos gives every verb its proper season, neither too early nor too late;
 * Awtsmoos.com keeps filesystem-changing deeds away from a burning listener, so the user meets a clear gate instead of a surprising state.
 */
export function runtimeActionDefinitions(state = {}) {
	const materialized = state.materialized === true;
	const running = state.runtime?.running === true;
	return Object.freeze([
		Object.freeze({
			action: "materialize",
			label: materialized ? "Rematerialize" : "Materialize",
			allowed: !running
		}),
		Object.freeze({
			action: "start",
			label: "Start",
			allowed: materialized && !running
		}),
		Object.freeze({ action: "status", label: "Health", allowed: true }),
		Object.freeze({ action: "activity", label: "Activity", allowed: true }),
		Object.freeze({
			action: "restart",
			label: "Restart",
			allowed: materialized && running
		}),
		Object.freeze({ action: "stop", label: "Stop", allowed: running }),
		Object.freeze({
			action: "cleanup",
			label: "Cleanup",
			allowed: materialized && !running
		})
	]);
}
