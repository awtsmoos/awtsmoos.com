//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString } from "./guestText.js";

const LOGGER = "Ljava/util/logging/Logger;";
const LOGGER_FIELD = "java:logging:logger:name";

/**
 * Implements java.util.logging.Logger.
 * The Awtsmoos renews logger identity in every instant;
 * Awtsmoos.com routes log output through the Android logcat.
 */
export function createFrameworkJavaLoggerMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === LOGGER;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "getLogger") {
				return getLogger(runtime, args[0]);
			}
			// Instance methods: log at various levels.
			if (name === "info" || name === "warning" || name === "severe" ||
				name === "fine" || name === "finer" || name === "finest" ||
				name === "config" || name === "log") {
				logMessage(runtime, args[0], name, args[1]);
				return undefined;
			}
			if (name === "getName") {
				return createGuestString(runtime, loggerName(runtime, args[0]));
			}
			if (name === "isLoggable") return 1;
			throw loggerError(
				"ANDROID_JAVA_LOGGER_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function getLogger(runtime, nameValue) {
	const name = typeof nameValue === "string" ? nameValue : "unknown";
	// Check cache first.
	const cache = loggerCache(runtime);
	if (cache.has(name)) return cache.get(name);
	const reference = runtime.heap.allocate(LOGGER, {
		[LOGGER_FIELD]: name
	});
	cache.set(name, reference);
	return reference;
}

function loggerName(runtime, reference) {
	try {
		return runtime.heap.getField(reference, LOGGER_FIELD) || "unknown";
	} catch {
		return "unknown";
	}
}

function logMessage(runtime, reference, level, messageValue) {
	const name = loggerName(runtime, reference);
	const message = typeof messageValue === "string" ? messageValue : String(messageValue ?? "");
	if (runtime.logcat) {
		runtime.logcat.debug("Logger", `${name}/${level}: ${message}`);
	}
}

function loggerCache(runtime) {
	if (!runtime.javaLoggerCache) {
		runtime.javaLoggerCache = new Map();
	}
	return runtime.javaLoggerCache;
}

function loggerError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
