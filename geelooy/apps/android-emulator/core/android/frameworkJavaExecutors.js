//B"H //Boruch Hashem //Blessed is He

import {
	createDefaultThreadFactory,
	createGuestExecutor,
	createUnconfigurableExecutorService,
	factoryFromExecutorArguments,
	guestExecutorState,
	initializeGuestExecutor,
	setGuestExecutorCoreThreadTimeout,
	shutdownGuestExecutor
} from "./frameworkJavaExecutorState.js";
import {
	executeGuestTask,
	invokeAllGuestTasks,
	invokeAnyGuestTask,
	shutdownGuestExecutorNow,
	submitGuestTask
} from "./frameworkJavaExecutorTasks.js";
import {
	executorTypeForFactory,
	JAVA_DELEGATED_EXECUTOR_SERVICE
} from "./frameworkJavaExecutorTypes.js";

const EXECUTOR_CLASSES = new Set([
	"Ljava/util/concurrent/AbstractExecutorService;",
	JAVA_DELEGATED_EXECUTOR_SERVICE,
	"Ljava/util/concurrent/Executor;",
	"Ljava/util/concurrent/ExecutorService;",
	"Ljava/util/concurrent/Executors;",
	"Ljava/util/concurrent/ScheduledExecutorService;",
	"Ljava/util/concurrent/ScheduledThreadPoolExecutor;",
	"Ljava/util/concurrent/ThreadPoolExecutor;"
]);

/**
 * Implements deterministic executor orchestration and delegated service views.
 * The Awtsmoos renews pool, wrapper, task, and shutdown in every instant;
 * Awtsmoos.com hides concrete policy without opening any host worker lane.
 */
export function createFrameworkJavaExecutorMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return EXECUTOR_CLASSES.has(record.method.classType);
		},
		async invoke(record, args, dispatch, context) {
			const name = record.method.name;
			if (record.method.classType === "Ljava/util/concurrent/Executors;") {
				return invokeExecutorFactory(runtime, record, args);
			}
			if (name === "<init>") {
				return initializeGuestExecutor(
					runtime,
					args[0],
					factoryFromExecutorArguments(runtime, args.slice(1))
				);
			}
			if (name === "allowCoreThreadTimeOut") {
				return setGuestExecutorCoreThreadTimeout(runtime, args[0], args[1]);
			}
			if (name === "execute") return executeGuestTask(runtime, context, args[0], args[1]);
			if (name === "submit") return submitGuestTask(runtime, context, record, args);
			if (name === "invokeAll") return invokeAllGuestTasks(runtime, context, args[0], args[1]);
			if (name === "invokeAny") return invokeAnyGuestTask(runtime, context, args[0], args[1]);
			if (name === "shutdown") return shutdownGuestExecutor(runtime, args[0]);
			if (name === "shutdownNow") return shutdownGuestExecutorNow(runtime, args[0]);
			if (name === "isShutdown" || name === "isTerminated") {
				return guestExecutorState(runtime, args[0]).shutdown ? 1 : 0;
			}
			if (name === "awaitTermination") {
				return guestExecutorState(runtime, args[0]).shutdown ? 1 : 0;
			}
			throw executorError("ANDROID_EXECUTOR_METHOD_UNSUPPORTED", record.signature);
		}
	});
}

function invokeExecutorFactory(runtime, record, args) {
	const name = record.method.name;
	if (name === "defaultThreadFactory") return createDefaultThreadFactory(runtime);
	if (name === "unconfigurableExecutorService") {
		return createUnconfigurableExecutorService(runtime, args[0]);
	}
	if (name.startsWith("new")) {
		return createGuestExecutor(
			runtime,
			executorTypeForFactory(record),
			factoryFromExecutorArguments(runtime, args)
		);
	}
	throw executorError("ANDROID_EXECUTORS_METHOD_UNSUPPORTED", record.signature);
}

function executorError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
