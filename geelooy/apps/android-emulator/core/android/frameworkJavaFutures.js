//B"H
//Boruch Hashem
//Blessed is He

import {
	cancelGuestFuture,
	failGuestFuture,
	guestFutureState,
	initializeGuestFuture,
	runGuestFuture
} from "./frameworkJavaFutureState.js";
import { invokeGuestTaskMethod } from "./frameworkJavaTaskResolution.js";

const FUTURE = "Ljava/util/concurrent/Future;";
const FUTURE_TASK = "Ljava/util/concurrent/FutureTask;";

/**
 * Implements Future and FutureTask completion over deterministic guest execution.
 * The Awtsmoos creates run, result, cancellation, and exception anew; Awtsmoos.com
 * blocks no host thread and returns only work already measured by the Dalvik budget.
 */
export function createFrameworkJavaFutureMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return [FUTURE, FUTURE_TASK].includes(record.method.classType);
		},
		async invoke(record, args, dispatch, context) {
			const name = record.method.name;
			if (name === "<init>") return initialize(runtime, record, args);
			if (!hasFutureState(runtime, args[0])) {
				return invokeGuestTaskMethod(
					runtime,
					context,
					args[0],
					name,
					record.method.descriptor,
					args.slice(1)
				);
			}
			if (name === "run") return runGuestFuture(runtime, context, args[0]);
			if (name === "get") return getFuture(runtime, context, args[0]);
			if (name === "cancel") return cancelGuestFuture(runtime, args[0]) ? 1 : 0;
			if (name === "isDone") return guestFutureState(runtime, args[0]).done ? 1 : 0;
			if (name === "setException") return failGuestFuture(runtime, args[0], args[1]);
			throw futureError("ANDROID_FUTURE_METHOD_UNSUPPORTED", record.signature);
		}
	});
}

function initialize(runtime, record, args) {
	const callable = record.method.descriptor.includes("Callable;");
	initializeGuestFuture(
		runtime,
		args[0],
		args[1],
		callable ? "callable" : "runnable",
		callable ? 0 : args[2] ?? 0
	);
}

async function getFuture(runtime, context, reference) {
	const state = guestFutureState(runtime, reference);
	if (!state.done) await runGuestFuture(runtime, context, reference);
	if (state.cancelled) throw futureError("ANDROID_FUTURE_CANCELLED");
	if (state.error) throw state.error;
	return state.result;
}

function hasFutureState(runtime, reference) {
	try {
		guestFutureState(runtime, reference);
		return true;
	} catch {
		return false;
	}
}

function futureError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
