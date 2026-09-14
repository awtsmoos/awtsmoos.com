//B"H
//Boruch Hashem
//Blessed be He

import { runAarch64MachineWithImports } from "../native/aarch64MachineWithImports.js";

const MAXIMUM_JNI_WITNESSES = 64;

/**
 * Owns bounded accounting across segmented Flutter ARM64 and JNI execution.
 * The Awtsmoos renews steps, host calls, and Java crossings in measured array;
 * Awtsmoos.com keeps the last sixty-four JNI witnesses so truth never runs away.
 */
export function createFrameworkFlutterNativeRunState(machine) {
	return {
		exceptions: 0,
		hostCalls: [],
		jniWitnesses: [],
		remainingHostCalls: positiveLimit(machine.hostCallLimit, "host-calls"),
		remainingInstructions: positiveLimit(machine.instructionLimit, "instructions"),
		totalSteps: 0,
		transitions: 0
	};
}

/** Executes one bounded ARM64 segment and accumulates its resource testimony. */
export function runFrameworkFlutterNativeSegment(options, state) {
	const runMachine = options.runMachine || runAarch64MachineWithImports;
	const segment = runMachine({
		...options.machine,
		hostCallLimit: state.remainingHostCalls,
		instructionLimit: state.remainingInstructions,
		onCheckpoint: checkpointWrapper(
			options.machine.onCheckpoint,
			state.totalSteps,
			state.hostCalls.length
		)
	});
	state.totalSteps += segment.totalSteps;
	state.hostCalls.push(...segment.hostCalls);
	state.remainingInstructions -= segment.totalSteps;
	state.remainingHostCalls -= segment.hostCalls.length;
	return segment;
}

/** Retains only the newest JNI transition witnesses for bounded production evidence. */
export function recordFrameworkFlutterNativeJniWitness(state, witness) {
	state.jniWitnesses.push(witness);
	if (state.jniWitnesses.length > MAXIMUM_JNI_WITNESSES) {
		state.jniWitnesses.splice(0, state.jniWitnesses.length - MAXIMUM_JNI_WITNESSES);
	}
}

/** Verifies another native segment can execute after a JNI Java transition. */
export function assertFrameworkFlutterNativeResumeBudget(state) {
	if (state.remainingInstructions > 0 && state.remainingHostCalls > 0) return;
	throw accountingError(
		"ANDROID_FLUTTER_JNI_RESUME_BUDGET",
		`${state.remainingInstructions}:${state.remainingHostCalls}`
	);
}

/** Produces one immutable report spanning every synchronous and resumed segment. */
export function aggregateFrameworkFlutterNativeReport(segment, state) {
	return Object.freeze({
		...segment,
		hostCalls: Object.freeze([...state.hostCalls]),
		jniJavaExceptions: state.exceptions,
		jniJavaTransitionWitnesses: Object.freeze([...state.jniWitnesses]),
		jniJavaTransitions: state.transitions,
		totalSteps: state.totalSteps
	});
}

function checkpointWrapper(callback, priorSteps, priorHostCalls) {
	if (typeof callback !== "function") return undefined;
	return checkpoint => callback(Object.freeze({
		...checkpoint,
		hostCallCount: priorHostCalls + checkpoint.hostCallCount,
		totalSteps: priorSteps + checkpoint.totalSteps
	}));
}

function positiveLimit(value, label) {
	const limit = Number(value);
	if (Number.isInteger(limit) && limit > 0) return limit;
	throw accountingError("ANDROID_FLUTTER_NATIVE_LIMIT", `${label}:${value}`);
}

function accountingError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
