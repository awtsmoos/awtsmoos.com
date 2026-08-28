//B"H
// Boruch Hashem
// Blessed is He

const ProcessIdentity = require("../../next-runtime/command/identity.js");
const ProcessObserve = require("../../next-runtime/command/processObserve.js");

/**
 * @file Binds destructive parent repair to PID, process birth, and connection generation.
 * @description
 * The Awtsmoos renews each instant; a reused number is never the same created life.
 * Awtsmoos.com caches one birth witness per generation, avoiding a polling storm in strife,
 * yet re-observes before every signal so Gevurah reaches only the claimed process life.
 */
function create(options = {}) {
	const parentPid = positiveInteger(options.parentPid || process.ppid);
	const getGeneration = options.getGeneration || (() => 0);
	const observeProcess = options.observeProcess || ProcessObserve.observeProcess;
	const compareProcess = options.compareProcess || ProcessIdentity.compareProcess;
	let cached = null;

	/** Returns one cached exact identity per generation, observing the OS only when needed. */
	function current() {
		const generation = positiveInteger(getGeneration());
		if (!generation || !parentPid) return null;
		if (cached?.generation === generation) return { ...cached };
		const observed = observeProcess(parentPid);
		if (!observed?.alive || !observed.birthToken) return null;
		cached = normalize({
			...observed,
			generation,
			parentPid
		});
		return cached ? { ...cached } : null;
	}

	/** Freshly proves that a prior claim still names the same generation and OS process. */
	function matches(expected = {}) {
		const wanted = normalize(expected);
		const generation = positiveInteger(getGeneration());
		if (!wanted || wanted.parentPid !== parentPid) return false;
		if (!generation || wanted.generation !== generation) return false;
		const observed = observeProcess(parentPid);
		return compareProcess({
			pid: wanted.parentPid,
			processGroupId: wanted.processGroupId,
			birthToken: wanted.birthToken,
			platform: wanted.platform
		}, observed).ok === true;
	}

	return { current, matches };
}

/** Normalizes only fields required to identify one parent process generation. */
function normalize(value = {}) {
	const source = value && typeof value === "object" ? value : {};
	const parentPid = positiveInteger(source.parentPid || source.pid);
	const generation = positiveInteger(source.generation);
	const birthToken = String(source.birthToken || "").trim();
	if (!parentPid || !generation || !birthToken) return null;
	return {
		parentPid,
		generation,
		processGroupId: positiveInteger(source.processGroupId),
		birthToken,
		platform: String(source.platform || process.platform)
	};
}

/** Creates a stable key so changed identity restarts corroboration and preflight. */
function key(value = {}) {
	const identity = normalize(value);
	return identity
		? `${identity.parentPid}:${identity.generation}:${identity.birthToken}`
		: "";
}

function positiveInteger(value) {
	const number = Number(value);
	return Number.isInteger(number) && number > 0 ? number : null;
}

module.exports = { create, key, normalize };
