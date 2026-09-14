//B"H
//Boruch Hashem
//Blessed be He

/**
 * @fileoverview Controls Flutter ARM64 execution across authentic JNI Java re-entry.
 * The Awtsmoos renews one machine state through every suspension and resumes only
 * after real Java/framework execution has restored the guest-visible JNI return ABI.
 */

import {
	aggregateFrameworkFlutterNativeReport,
	assertFrameworkFlutterNativeResumeBudget,
	createFrameworkFlutterNativeRunState,
	runFrameworkFlutterNativeSegment
} from "./frameworkFlutterNativeMachineAccounting.js";
import { completeFrameworkFlutterNativeJniCall } from "./frameworkFlutterNativeJniTransition.js";

const JNI_JAVA_CALL_STOP = "jni-java-call";

/**
 * Runs one native call synchronously unless guest ARM64 genuinely invokes Java.
 * @param {object} options Native machine, runtime, session, scope, and Java context.
 * @returns {object|Promise<object>} Complete cumulative native execution testimony.
 */
export function runFrameworkFlutterNativeMachine(options) {
	const state = createFrameworkFlutterNativeRunState(options.machine);
	const segment = runFrameworkFlutterNativeSegment(options, state);
	if (segment.reason !== JNI_JAVA_CALL_STOP) {
		return aggregateFrameworkFlutterNativeReport(segment, state);
	}
	return resumeAcrossJava(options, state, segment);
}

async function resumeAcrossJava(options, state, firstSegment) {
	let segment = firstSegment;
	while (segment.reason === JNI_JAVA_CALL_STOP) {
		const request = readJniCallRequest(segment);
		const transition = await completeFrameworkFlutterNativeJniCall(
			options,
			request
		);
		state.transitions += 1;
		if (transition.exception) state.exceptions += 1;
		assertFrameworkFlutterNativeResumeBudget(state);
		segment = runFrameworkFlutterNativeSegment(options, state);
	}
	return aggregateFrameworkFlutterNativeReport(segment, state);
}

function readJniCallRequest(segment) {
	const request = segment.hostCalls.at(-1)?.result?.jniCall;
	if (request) return request;
	const error = new Error(
		`ANDROID_FLUTTER_JNI_STOP_REQUEST:${segment.reason}`
	);
	error.code = "ANDROID_FLUTTER_JNI_STOP_REQUEST";
	throw error;
}
