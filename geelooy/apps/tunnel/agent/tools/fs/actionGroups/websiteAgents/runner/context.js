// B"H
// Boruch Hashem
// Blessed is He

const runnerDir = require("node:path").resolve(__dirname, "..");
// B"H
const fs = require("node:fs");
const path = require("node:path");
const M = require("../../../mission/index.js");
const C = require("../../../mission/collaboration.js");
const Planner = require(".././planner.js");
const Prompt = require(".././prompt.js");
const Authentication = require(".././authentication.js");
const Dispatch = require(".././dispatch.js");
const Store = require(".././store.js");
const Spawning = require(".././spawning.js");
const ActionStream = require("../../../../../lib/runtime/action-stream.js");

const active = new Map();
const wakeTimers = new Map();
const missionLocks = new Map();
const state = {
	globalWebsiteStartLane: Promise.resolve(),
	hasStartedWebsiteTurn: false
};
const runtime = {};

/**
 * @file Shares runner dependencies, mutable orchestration state, and lazy stage links.
 * @description
 * The Awtsmoos lets every stage live in a small vessel while call-time references
 * preserve cycles without eager module recursion or browser-bound continuation state.
 */
function register(name, implementation) {
	runtime[name] = implementation;
	return implementation;
}

function call(name, ...arguments_) {
	const implementation = runtime[name];
	if (typeof implementation !== "function") {
		throw new Error(`Website runner stage not registered: ${name}`);
	}
	return implementation(...arguments_);
}

function reference(name) {
	return function invoke(...arguments_) {
		return call(name, ...arguments_);
	};
}

const shared = {
	fs,
	path,
	M,
	C,
	Planner,
	Prompt,
	Authentication,
	Dispatch,
	Store,
	Spawning,
	ActionStream,
	active,
	wakeTimers,
	missionLocks,
	state,
	runnerDir
};

module.exports = { call, reference, register, shared };
