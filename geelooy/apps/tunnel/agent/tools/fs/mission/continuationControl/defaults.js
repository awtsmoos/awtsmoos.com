// B"H

const SCHEMA_VERSION = 1;
const DESIRED_STATES = new Set(["running", "paused", "draining", "stopped"]);
const PAUSE_MODES = new Set(["after-action"]);
const UPDATE_CADENCES = new Set(["silent", "gates", "milestones", "normal", "verbose"]);

const PRESETS = Object.freeze({
	gentle: {
		label: "Gentle",
		maxTurns: 8,
		maxRuntimeMinutes: 30,
		maxConsecutiveErrors: 2,
		intervalMs: 12000,
		updateCadence: "milestones"
	},
	focused: {
		label: "Focused",
		maxTurns: 25,
		maxRuntimeMinutes: 120,
		maxConsecutiveErrors: 3,
		intervalMs: 5000,
		updateCadence: "normal"
	},
	deep: {
		label: "Deep work",
		maxTurns: 100,
		maxRuntimeMinutes: 480,
		maxConsecutiveErrors: 5,
		intervalMs: 2500,
		updateCadence: "milestones"
	},
	overnight: {
		label: "Overnight",
		maxTurns: 500,
		maxRuntimeMinutes: 720,
		maxConsecutiveErrors: 8,
		intervalMs: 5000,
		updateCadence: "gates"
	},
	review: {
		label: "Review only",
		maxTurns: 1,
		maxRuntimeMinutes: 15,
		maxConsecutiveErrors: 1,
		intervalMs: 10000,
		updateCadence: "verbose"
	}
});

function base(now = new Date().toISOString()) {
	return {
		schemaVersion: SCHEMA_VERSION,
		revision: 0,
		runtimeRevision: 0,
		preset: "focused",
		desiredState: "running",
		observedState: "idle",
		pauseMode: "after-action",
		updateCadence: "normal",
		maxTurns: 25,
		maxRuntimeMinutes: 120,
		maxConsecutiveErrors: 3,
		intervalMs: 5000,
		pausePollMs: 5000,
		deadlineAt: null,
		startedTurns: 0,
		completedTurns: 0,
		totalErrors: 0,
		consecutiveErrors: 0,
		oneTurnCredits: 0,
		createdAt: now,
		updatedAt: now,
		policyUpdatedAt: now,
		runtimeUpdatedAt: null,
		lastGateReason: null,
		lastActor: null,
		lastReason: null
	};
}

module.exports = {
	DESIRED_STATES,
	PAUSE_MODES,
	PRESETS,
	SCHEMA_VERSION,
	UPDATE_CADENCES,
	base
};
