// B"H
'use strict';

/**
 * @file laneCatalog.js
 * @description Twelve rescue vessels share doctrine but not life-support. Each
 * lane receives its own process, port and state root, so the Awtsmoos may reveal
 * continuity through one lane even while eleven others vanish.
 */
const DEFINITIONS = [
	['beacon', 7410, ['health', 'mission']],
	['direct-control', 7411, ['health', 'mission', 'handoff']],
	['websocket-relay', 7412, ['health', 'mission', 'handoff']],
	['command-admission', 7413, ['health', 'mission', 'handoff', 'command-admit']],
	['command-observe', 7414, ['health', 'mission', 'handoff', 'command-observe']],
	['filesystem-read', 7415, ['health', 'mission', 'handoff', 'fs-read']],
	['filesystem-write-guarded', 7416, ['health', 'mission', 'handoff', 'fs-write-guarded']],
	['handoff-custody', 7417, ['health', 'mission', 'handoff', 'custody']],
	['mission-capsule', 7418, ['health', 'mission', 'handoff']],
	['recovery-guardian', 7419, ['health', 'mission', 'handoff', 'recover']],
	['emergency-docs', 7420, ['health', 'mission']],
	['local-recovery', 7421, ['health', 'mission', 'handoff', 'recover-local']]
];

const LANES = Object.freeze(Object.fromEntries(DEFINITIONS.map(([id, port, capabilities]) => [
	id,
	Object.freeze({ id, port, capabilities: Object.freeze(capabilities) })
])));

function lane(id) {
	const value = LANES[String(id || '')];
	if (!value) throw new Error(`B"H unknown emergency lane: ${id}`);
	return value;
}

module.exports = { LANES, lane, laneIds: () => Object.keys(LANES) };
