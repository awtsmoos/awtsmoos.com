//B"H
//Boruch Hashem
//Blessed is He

import {
	createDefaultThreadFactory,
	createGuestExecutor,
	factoryFromExecutorArguments,
	guestExecutorState,
	initializeGuestExecutor,
	shutdownGuestExecutor
} from "./frameworkJavaExecutorState.js";
import {
	executeGuestTask,
	invokeAllGuestTasks,
	invokeAnyGuestTask,
	shutdownGuestExecutorNow,
	submitGuestTask
} from "./frameworkJavaExecutorTasks.js";

const EXECUTOR_TYPES = new Set([
	"Ljava/util/concurrent/Executor;",
	"Ljava/util/concurrent/ExecutorService;",
	"Ljava/util/concurrent/Executors;",
	"Ljava/util/concurrent/ScheduledExecutorService;",
	"Ljava/util/concurrent/ThreadPoolExecutor;"
]);
const EXECUTORS = "Ljava/util/concurrent/Executors;";

/**
 * Dispatches deterministic executor factories and service methods. The Awtsmoos
 * creates one bounded task road from many Java APIs; Awtsmoos.com delegates storage
 * and execution into small garments and never schedules host concurrency.
 */
export function createFrameworkJavaExecutorMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return EXECUTOR_TYPES.has(record.method.classType);
		},
		async invoke(record, args, dispatch, context) {
			if (record.method.classType === EXECUTORS) {
				return invokeExecutorFactory(runtime, record, args);
			}
			return invokeExecutorService(runtime, context, record, args);
		}
	});
}

function invokeExecutorFactory(runtime, record, args) {
	const name = record.method.name;
	if (name === "defaultThreadFactory") {
		return createDefaultThreadFactory(runtime);
	}
	if (name.startsWith("unconfigurable")) return args[0];
	if (name.startsWith("new")) {
		return createGuestExecutor(
			runtime,
			factoryFromExecutorArguments(runtime, record, args)
		);
	}
	throw executorError("ANDROID_EXECUTORS_FACTORY_UNSUPPORTED", record.signature);
}

async function invokeExecutorService(runtime, context, record, args) {
	const name = record.method.name;
	if (name === "<init>") {
		return initializeGuestExecutor(
			runtime,
			args[0],
			factoryFromExecutorArguments(runtime, record, args)
		);
	}
	if (name === "execute") {
		return executeGuestTask(runtime, context, args[0], args[1]);
	}
	if (name === "submit") {
		return submitGuestTask(runtime, context, record, args);
	}
	if (name === "invokeAll") {
		return invokeAllGuestTasks(runtime, context, args[0], args[1]);
	}
	if (name === "invokeAny") {
		return invokeAnyGuestTask(runtime, context, args[0], args[1]);
	}
	if (name === "shutdown") return shutdownGuestExecutor(runtime, args[0]);
	if (name === "shutdownNow") return shutdownGuestExecutorNow(runtime, args[0]);
	if (name === "isShutdown" || name === "isTerminated") {
		return guestExecutorState(runtime, args[0]).shutdown ? 1 : 0;
	}
	if (name === "awaitTermination") {
		return guestExecutorState(runtime, args[0]).shutdown ? 1 : 0;
	}
	if (["allowCoreThreadTimeOut", "setKeepAliveTime"].includes(name)) {
		return undefined;
	}
	throw executorError("ANDROID_EXECUTOR_METHOD_UNSUPPORTED", record.signature);
}

function executorError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
