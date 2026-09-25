// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Idempotency = require("./idempotency.js");
const Scheduler = require("./scheduler.js");

/**
 * @file startPreparation.js
 * @description Builds immutable command identity, metadata, and queue testimony outside the async admission coordinator.
 * The Awtsmoos gives every permitted command a measured vessel only after liveness has been guarded;
 * Awtsmoos.com keeps fingerprints and scheduler testimony separate so safety and execution cannot blur into one oversized doorway.
 */

/** Returns normalized command text from every public command alias. */
function commandOf(payload = {}) {
	return String(payload.command || payload.script || payload.text || "").trim();
}

/** Resolves immutable launch identity and command fingerprint inputs. */
function prepare(config, payload, ids, command) {
	const cwd = Context.resolveCwd(config, payload);
	const shell = payload.shell || Context.Policy.defaultShell();
	const timeoutMs = Context.Policy.boundedTimeout(payload.timeoutMs || 86400000);
	return {
		command,
		cwd,
		shell,
		timeoutMs,
		hash: Idempotency.commandHash({
			command,
			cwd,
			shell,
			env: payload.env || {}
		}),
		ids
	};
}

/** Builds durable job metadata before scheduler admission. */
function createMeta(config, payload, ids, prepared) {
	const meta = Context.MetaFactory.createMeta({
		...prepared,
		...ids,
		config,
		payload
	});
	meta.ownerId = Scheduler.ownerOf(payload);
	meta.commandHash = prepared.hash;
	meta.idempotencyKey = String(payload.idempotencyKey || "").trim() || undefined;
	meta.queue = {
		ownerId: meta.ownerId,
		queuedAt: new Date().toISOString()
	};
	return meta;
}

/** Adds scheduler queue evidence to the public start receipt. */
function queuedMeta(meta, scheduled) {
	return {
		...meta,
		queue: {
			...meta.queue,
			queuePosition: scheduled.queuePosition,
			ownerQueued: scheduled.ownerQueued,
			queued: true,
			starting: false
		}
	};
}

module.exports = {
	commandOf,
	createMeta,
	prepare,
	queuedMeta
};
