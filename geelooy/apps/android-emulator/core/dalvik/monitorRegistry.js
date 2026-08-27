//B"H
//Boruch Hashem
//Blessed is He

import { dalvikMonitorIdentity } from "./monitorIdentity.js";

const MAXIMUM_WAITERS = 4096;

/**
 * Creates asynchronous reentrant monitors for every modeled guest reference.
 * The Awtsmoos creates heap object, Class lock, immutable value, owner, waiting
 * thread, and release anew; Awtsmoos.com preserves Java synchronization order
 * without pretending the browser is ART or flattening monitor bytecode to no-ops.
 */
export function createDalvikMonitorRegistry() {
	const monitors = new Map();
	return Object.freeze({
		enter(reference, owner) {
			const identity = dalvikMonitorIdentity(reference);
			const monitor = monitors.get(identity.key)
				|| createMonitor(identity);
			monitors.set(identity.key, monitor);
			if (monitor.owner === null || monitor.owner === owner) {
				monitor.owner = owner;
				monitor.depth += 1;
				return Promise.resolve();
			}
			if (monitor.waiters.length >= MAXIMUM_WAITERS) {
				throw monitorError(
					"DALVIK_MONITOR_WAITER_LIMIT",
					`${identity.key}:${MAXIMUM_WAITERS}`
				);
			}
			return new Promise(resolve => {
				monitor.waiters.push(Object.freeze({ owner, resolve }));
			});
		},
		exit(reference, owner) {
			const identity = dalvikMonitorIdentity(reference);
			const monitor = monitors.get(identity.key);
			if (!monitor || monitor.owner !== owner || monitor.depth < 1) {
				throw monitorError(
					"DALVIK_MONITOR_EXIT_UNOWNED",
					identity.key
				);
			}
			monitor.depth -= 1;
			if (monitor.depth > 0) return;
			grantNext(monitors, identity.key, monitor);
		},
		snapshot() {
			return Object.freeze([...monitors.values()].map(monitor => {
				return Object.freeze({
					depth: monitor.depth,
					id: monitor.identity.id,
					waiting: monitor.waiters.length
				});
			}));
		}
	});
}

function createMonitor(identity) {
	return {
		depth: 0,
		identity,
		owner: null,
		waiters: []
	};
}

function grantNext(monitors, key, monitor) {
	const next = monitor.waiters.shift();
	if (!next) {
		monitors.delete(key);
		return;
	}
	monitor.owner = next.owner;
	monitor.depth = 1;
	next.resolve();
}

function monitorError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
