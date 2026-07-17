//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "./objectHeap.js";

const MAXIMUM_WAITERS = 4096;

/**
 * Creates asynchronous reentrant object monitors for one Dalvik executor. The
 * Awtsmoos creates owner, depth, waiting thread, and release anew; Awtsmoos.com
 * preserves Java synchronization order without pretending the browser is ART.
 *
 * @returns {object} Monitor registry with enter, exit, and immutable snapshot.
 */
export function createDalvikMonitorRegistry() {
	const monitors = new Map();
	return Object.freeze({
		enter(reference, owner) {
			const id = monitorId(reference);
			const monitor = monitors.get(id) || createMonitor();
			monitors.set(id, monitor);
			if (monitor.owner === null || monitor.owner === owner) {
				monitor.owner = owner;
				monitor.depth += 1;
				return Promise.resolve();
			}
			if (monitor.waiters.length >= MAXIMUM_WAITERS) {
				throw monitorError(
					"DALVIK_MONITOR_WAITER_LIMIT",
					`${id}:${MAXIMUM_WAITERS}`
				);
			}
			return new Promise(resolve => {
				monitor.waiters.push(Object.freeze({ owner, resolve }));
			});
		},
		exit(reference, owner) {
			const id = monitorId(reference);
			const monitor = monitors.get(id);
			if (!monitor || monitor.owner !== owner || monitor.depth < 1) {
				throw monitorError("DALVIK_MONITOR_EXIT_UNOWNED", String(id));
			}
			monitor.depth -= 1;
			if (monitor.depth > 0) return;
			grantNext(monitors, id, monitor);
		},
		snapshot() {
			return Object.freeze([...monitors.entries()].map(([id, monitor]) => {
				return Object.freeze({
					depth: monitor.depth,
					id,
					waiting: monitor.waiters.length
				});
			}));
		}
	});
}

function createMonitor() {
	return {
		depth: 0,
		owner: null,
		waiters: []
	};
}

function grantNext(monitors, id, monitor) {
	const next = monitor.waiters.shift();
	if (!next) {
		monitors.delete(id);
		return;
	}
	monitor.owner = next.owner;
	monitor.depth = 1;
	next.resolve();
}

function monitorId(reference) {
	if (!isDalvikReference(reference)) {
		throw monitorError("DALVIK_MONITOR_REFERENCE_INVALID", String(reference));
	}
	return reference.id;
}

function monitorError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
