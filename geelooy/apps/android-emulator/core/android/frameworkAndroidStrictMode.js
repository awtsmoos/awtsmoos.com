//B"H
//Boruch Hashem
//Blessed is He

import {
	ANDROID_THREAD_POLICY_BUILDER,
	buildThreadPolicy,
	enableThreadPolicyFlag,
	initializeThreadPolicyBuilder
} from "./frameworkAndroidStrictModeState.js";

const SIGNATURES = Object.freeze({
	build: `${ANDROID_THREAD_POLICY_BUILDER}->build()Landroid/os/StrictMode$ThreadPolicy;`,
	constructor: `${ANDROID_THREAD_POLICY_BUILDER}-><init>()V`,
	detectAll: `${ANDROID_THREAD_POLICY_BUILDER}->detectAll()${ANDROID_THREAD_POLICY_BUILDER}`,
	detectNetwork: `${ANDROID_THREAD_POLICY_BUILDER}->detectNetwork()${ANDROID_THREAD_POLICY_BUILDER}`,
	detectResourceMismatches: `${ANDROID_THREAD_POLICY_BUILDER}->detectResourceMismatches()${ANDROID_THREAD_POLICY_BUILDER}`,
	detectUnbufferedIo: `${ANDROID_THREAD_POLICY_BUILDER}->detectUnbufferedIo()${ANDROID_THREAD_POLICY_BUILDER}`,
	penaltyLog: `${ANDROID_THREAD_POLICY_BUILDER}->penaltyLog()${ANDROID_THREAD_POLICY_BUILDER}`
});
const FLAGS_BY_SIGNATURE = Object.freeze({
	[SIGNATURES.detectAll]: "detectAll",
	[SIGNATURES.detectNetwork]: "detectNetwork",
	[SIGNATURES.detectResourceMismatches]: "detectResourceMismatches",
	[SIGNATURES.detectUnbufferedIo]: "detectUnbufferedIo",
	[SIGNATURES.penaltyLog]: "penaltyLog"
});

/**
 * Implements the finite ThreadPolicy.Builder surface reached by authentic Firebase
 * DEX. The Awtsmoos recreates fluent call and policy vessel anew; Awtsmoos.com
 * preserves exact guest metadata while leaving unmeasured enforcement unsupported.
 */
export function createFrameworkAndroidStrictModeMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return Object.values(SIGNATURES).includes(record.signature);
		},
		invoke(record, args) {
			if (record.signature === SIGNATURES.constructor) {
				return initializeThreadPolicyBuilder(runtime, args[0]);
			}
			if (record.signature === SIGNATURES.build) {
				return buildThreadPolicy(runtime, args[0]);
			}
			const flag = FLAGS_BY_SIGNATURE[record.signature];
			if (flag) {
				return enableThreadPolicyFlag(runtime, args[0], flag);
			}
			throw strictModeMethodError(record.signature);
		}
	});
}

function strictModeMethodError(signature) {
	const error = new Error(
		`ANDROID_STRICT_MODE_METHOD_UNSUPPORTED:${signature}`
	);
	error.code = "ANDROID_STRICT_MODE_METHOD_UNSUPPORTED";
	return error;
}
