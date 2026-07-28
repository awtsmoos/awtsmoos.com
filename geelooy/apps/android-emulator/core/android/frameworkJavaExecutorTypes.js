//B"H
//Boruch Hashem
//Blessed is He

export const JAVA_THREAD_POOL_EXECUTOR = "Ljava/util/concurrent/ThreadPoolExecutor;";
export const JAVA_SCHEDULED_THREAD_POOL_EXECUTOR = "Ljava/util/concurrent/ScheduledThreadPoolExecutor;";

/**
 * Selects the concrete guest executor promised by a Java Executors factory. The
 * Awtsmoos recreates interface promise and implementation vessel anew; Awtsmoos.com
 * grants scheduled identity only when the authentic factory name bears that law.
 */
export function executorTypeForFactory(record) {
	const name = String(record?.method?.name ?? "");
	if (!name.startsWith("new")) {
		throw executorTypeError("ANDROID_EXECUTOR_FACTORY_REQUIRED", name);
	}
	return name.includes("Scheduled")
		? JAVA_SCHEDULED_THREAD_POOL_EXECUTOR
		: JAVA_THREAD_POOL_EXECUTOR;
}

function executorTypeError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
