// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Elects which tunnel route serves new work, with anti-flap hysteresis.
 * @description
 * The Awtsmoos walks the living road: when the primary route is not alive but a
 * rescue route is, new generations are promoted to the rescue route — loudly,
 * reversibly, and only after sustained evidence. The primary is preferred the
 * moment it proves itself healthy again, also only after sustained evidence, so
 * one lucky probe can neither crown nor dethrone a route.
 *
 * Policy:
 * - observe(probes) takes one round of route liveness, e.g.
 *   { primary: { alive: true }, rescue: { alive: false } } (stubbed my-device
 *   in tests; a real my-device poller in production tooling).
 * - Promote: K consecutive rounds with the elected (primary) route not alive
 *   AND a rescue route alive  ->  the rescue route serves new generations.
 * - Demote: M consecutive rounds with the primary alive again  ->  back to primary.
 * - Both alive: primary is always preferred. No healthy alternative: hold the
 *   current route rather than jumping into darkness.
 * - Single configured route: the elector is a pass-through; behavior is
 *   identical to having no elector at all.
 *
 * This module decides; it never dials, never kills the unelected route, and
 * never claims exclusive ownership — both tunnels stay registered by design.
 */

const DEFAULT_PROMOTE_AFTER_FAILURES = 3;
const DEFAULT_DEMOTE_AFTER_SUCCESSES = 5;

function createRouteElector(options = {}) {
	const routes = normalizeRoutes(options.routes);
	const primary = routes[0];
	const promoteAfter = positiveInt(options.promoteAfterFailures, DEFAULT_PROMOTE_AFTER_FAILURES);
	const demoteAfter = positiveInt(options.demoteAfterSuccesses, DEFAULT_DEMOTE_AFTER_SUCCESSES);
	const log = typeof options.log === "function" ? options.log : () => {};
	let elected = primary;
	let consecutivePrimaryFailures = 0;
	let consecutivePrimarySuccesses = 0;
	let transitions = 0;

	function aliveOf(probes, name) {
		const probe = probes && typeof probes === "object" ? probes[name] : undefined;
		if (probe === true) return true;
		if (probe === false) return false;
		if (probe && typeof probe === "object") {
			if (probe.alive === true) return true;
			if (probe.alive === false) return false;
		}
		return undefined;
	}

	function healthyAlternative(probes, except) {
		return routes.find(route =>
			route.name !== except && aliveOf(probes, route.name) === true
		) || null;
	}

	/** Records one round of route liveness and returns the election snapshot. */
	function observe(probes = {}) {
		if (routes.length < 2) return snapshot();
		const primaryAlive = aliveOf(probes, primary.name);
		if (elected.name === primary.name) {
			if (primaryAlive === false) {
				consecutivePrimaryFailures += 1;
				consecutivePrimarySuccesses = 0;
			} else if (primaryAlive === true) {
				consecutivePrimaryFailures = 0;
				consecutivePrimarySuccesses = 0;
			}
			const rescue = healthyAlternative(probes, primary.name);
			if (rescue && consecutivePrimaryFailures >= promoteAfter) {
				transition(rescue, `primary not alive x${consecutivePrimaryFailures}; promoting healthy ${rescue.name}`);
			}
		} else {
			if (primaryAlive === true) {
				consecutivePrimarySuccesses += 1;
				consecutivePrimaryFailures = 0;
				if (consecutivePrimarySuccesses >= demoteAfter) {
					transition(primary, `primary healthy x${consecutivePrimarySuccesses}; demoting back to primary`);
				}
			} else if (primaryAlive === false) {
				consecutivePrimarySuccesses = 0;
				const currentAlive = aliveOf(probes, elected.name);
				if (currentAlive === false) {
					const other = healthyAlternative(probes, elected.name);
					if (other) transition(other, `elected ${elected.name} not alive; moving to healthy ${other.name}`);
				}
			}
		}
		return snapshot();
	}

	function transition(next, reason) {
		const previous = elected;
		elected = next;
		consecutivePrimaryFailures = 0;
		consecutivePrimarySuccesses = 0;
		transitions += 1;
		log("warn", `B"H route elector: ${previous.name} -> ${next.name}: ${reason}`);
	}

	function current() {
		return { ...elected };
	}

	function reset() {
		elected = primary;
		consecutivePrimaryFailures = 0;
		consecutivePrimarySuccesses = 0;
	}

	function snapshot() {
		return {
			elected: elected.name,
			routes: routes.map(route => route.name),
			consecutivePrimaryFailures,
			consecutivePrimarySuccesses,
			promoteAfterFailures: promoteAfter,
			demoteAfterSuccesses: demoteAfter,
			transitions
		};
	}

	return { aliveOf, current, observe, reset, snapshot };
}

function normalizeRoutes(routes) {
	const list = (Array.isArray(routes) ? routes : []).filter(Boolean);
	if (!list.length) {
		return [{ name: "primary" }];
	}
	return list.map((route, index) => {
		if (typeof route === "string") {
			return { name: route || (index === 0 ? "primary" : `route-${index}`) };
		}
		return {
			name: String(route.name || (index === 0 ? "primary" : `route-${index}`)),
			tunnelName: route.tunnelName,
			wsUrl: route.wsUrl,
			routeReference: route.routeReference
		};
	});
}

function positiveInt(value, fallback) {
	const number = Math.floor(Number(value));
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

module.exports = {
	DEFAULT_DEMOTE_AFTER_SUCCESSES,
	DEFAULT_PROMOTE_AFTER_FAILURES,
	createRouteElector
};
