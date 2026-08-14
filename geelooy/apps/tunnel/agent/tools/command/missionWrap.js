// B"H
// Boruch Hashem
// Blessed is He

const Lock = require("../fs/mission/lock/index.js");
const Runtime = require("../fs/actionRuntime.js");
const Boot = require("../fs/mission/implicitBoot/index.js");
const Envelope = require("../fs/mission/envelope/index.js");

const DEFAULT_ANNOTATION_WAIT_MS = 75;

/** Mission health is advisory and may never delay durable command acceptance. */
async function prepare(config, payload = {}) {
	const active = await Runtime.healthyActive(config);
	const boot = await Boot.maybeStart(config, payload, active);
	return { active: boot?.lock || active, boot };
}

async function run(config, payload, worker) {
	const work = invoke(() => worker(config, payload));
	const mission = observe(() => prepare(config, payload));
	const result = await work;
	if (!asyncAcceptance(result) && !mission.settled) {
		await waitFor(mission, annotationWaitMs());
	}
	if (!mission.settled) return pending(result);
	if (mission.error) return unavailable(result);
	const lock = Lock.active(config) || mission.value?.active;
	return Boot.annotate(
		Envelope.wrap(lock, result, payload),
		mission.value?.boot
	);
}

function observe(task) {
	const state = { settled: false, value: null, error: null };
	state.promise = invoke(task).then(
		value => Object.assign(state, { settled: true, value }),
		error => Object.assign(state, { settled: true, error })
	);
	return state;
}

function invoke(task) {
	try {
		return Promise.resolve(task());
	} catch (error) {
		return Promise.reject(error);
	}
}

async function waitFor(state, milliseconds) {
	let timer;
	await Promise.race([
		state.promise,
		new Promise(resolve => {
			timer = setTimeout(resolve, milliseconds);
		})
	]);
	if (timer) clearTimeout(timer);
}

function asyncAcceptance(result = {}) {
	return Boolean(
		result.jobId &&
		(result.running === true || ["queued", "spawning", "running"]
			.includes(String(result.status || "")))
	);
}

function pending(result = {}) {
	return advisory(result, {
		missionAnnotationPending: true,
		note: "Mission health continues independently of command acceptance."
	});
}

function unavailable(result = {}) {
	return advisory(result, {
		missionAnnotationUnavailable: true,
		note: "Command acceptance succeeded; mission annotation was unavailable."
	});
}

function advisory(result, detail) {
	const current = result.agentGuidance && typeof result.agentGuidance === "object"
		? result.agentGuidance
		: {};
	return {
		...result,
		...detail,
		agentGuidance: { ...current, ...detail }
	};
}

function annotationWaitMs() {
	const value = Number(
		process.env.AWTSMOOS_COMMAND_MISSION_ANNOTATION_WAIT_MS
	);
	return Number.isFinite(value)
		? Math.max(1, Math.min(Math.floor(value), 250))
		: DEFAULT_ANNOTATION_WAIT_MS;
}

module.exports = {
	DEFAULT_ANNOTATION_WAIT_MS,
	annotationWaitMs,
	asyncAcceptance,
	prepare,
	run
};
