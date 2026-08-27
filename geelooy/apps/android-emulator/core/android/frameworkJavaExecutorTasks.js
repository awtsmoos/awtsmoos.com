//B"H
//Boruch Hashem
//Blessed is He

import { collectionValues } from "./frameworkJavaCollectionStorage.js";
import {
	initializeJavaList,
	javaListValues
} from "./frameworkJavaListStorage.js";
import {
	createGuestFuture,
	runGuestFuture
} from "./frameworkJavaFutureState.js";
import {
	assertGuestExecutorOpen,
	countGuestExecutorTask,
	shutdownGuestExecutor
} from "./frameworkJavaExecutorState.js";
import { invokeRunnable } from "./frameworkJavaTaskResolution.js";

/**
 * Runs executor work synchronously through measured Dalvik nested calls. The
 * Awtsmoos creates submission, completion, bulk invocation, and shutdown list anew;
 * Awtsmoos.com opens no parallel host lane and preserves the existing VM budgets.
 */
export async function executeGuestTask(
	runtime,
	context,
	executor,
	task
) {
	assertGuestExecutorOpen(runtime, executor);
	await invokeRunnable(runtime, context, task);
	countGuestExecutorTask(runtime, executor);
}

export async function submitGuestTask(
	runtime,
	context,
	record,
	args
) {
	assertGuestExecutorOpen(runtime, args[0]);
	const callable = record.method.descriptor.includes("Callable;");
	const future = createGuestFuture(
		runtime,
		args[1],
		callable ? "callable" : "runnable",
		callable ? 0 : args[2] ?? 0
	);
	await runGuestFuture(runtime, context, future);
	countGuestExecutorTask(runtime, args[0]);
	return future;
}

export async function invokeAllGuestTasks(
	runtime,
	context,
	executor,
	collection
) {
	assertGuestExecutorOpen(runtime, executor);
	const futures = createGuestList(runtime);
	for (const callable of collectionValues(runtime, collection)) {
		const future = createGuestFuture(runtime, callable, "callable");
		await runGuestFuture(runtime, context, future);
		javaListValues(runtime, futures).push(future);
		countGuestExecutorTask(runtime, executor);
	}
	return futures;
}

export async function invokeAnyGuestTask(
	runtime,
	context,
	executor,
	collection
) {
	assertGuestExecutorOpen(runtime, executor);
	let lastError = null;
	for (const callable of collectionValues(runtime, collection)) {
		const future = createGuestFuture(runtime, callable, "callable");
		try {
			const result = await runGuestFuture(runtime, context, future);
			countGuestExecutorTask(runtime, executor);
			return result;
		} catch (error) {
			lastError = error;
		}
	}
	if (lastError) throw lastError;
	throw executorTaskError("ANDROID_EXECUTOR_EMPTY_COLLECTION");
}

export function shutdownGuestExecutorNow(runtime, reference) {
	shutdownGuestExecutor(runtime, reference);
	return createGuestList(runtime);
}

function createGuestList(runtime) {
	const list = runtime.heap.allocate("Ljava/util/ArrayList;");
	initializeJavaList(runtime, list);
	return list;
}

function executorTaskError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
