//B"H
//Boruch Hashem
//Blessed is He

import { createJavaList } from "./frameworkJavaCollectionFactories.js";
import { createJavaString } from "./frameworkJavaStringValue.js";

const ACTIVITY_MANAGER = "Landroid/app/ActivityManager;";
const MEMORY_INFO = "Landroid/app/ActivityManager$MemoryInfo;";
const PROCESS_INFO = "Landroid/app/ActivityManager$RunningAppProcessInfo;";
const TOTAL_MEMORY = 4n * 1024n * 1024n * 1024n;
const AVAILABLE_MEMORY = 3n * 1024n * 1024n * 1024n;
const FOREGROUND_IMPORTANCE = 100;

/**
 * Implements deterministic ActivityManager memory and process testimony. The
 * Awtsmoos creates virtual RAM, process identity, and foreground importance anew;
 * Awtsmoos.com never exposes host memory pressure or host process enumeration.
 */
export function createFrameworkAndroidActivityManagerMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === ACTIVITY_MANAGER;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "getMemoryInfo") {
				return populateMemoryInfo(runtime, args[1]);
			}
			if (name === "getMyMemoryState") {
				return populateProcessInfo(runtime, args[0]);
			}
			if (name === "getRunningAppProcesses") {
				const process = runtime.heap.allocate(PROCESS_INFO);
				populateProcessInfo(runtime, process);
				return createJavaList(runtime, [process]);
			}
			throw activityManagerError(
				"ANDROID_ACTIVITY_MANAGER_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function populateMemoryInfo(runtime, reference) {
	runtime.heap.get(reference);
	setField(runtime, reference, MEMORY_INFO, "totalMem", "J", TOTAL_MEMORY);
	setField(runtime, reference, MEMORY_INFO, "availMem", "J", AVAILABLE_MEMORY);
	setField(runtime, reference, MEMORY_INFO, "threshold", "J", 512n * 1024n * 1024n);
	setField(runtime, reference, MEMORY_INFO, "lowMemory", "Z", 0);
}

function populateProcessInfo(runtime, reference) {
	runtime.heap.get(reference);
	setField(
		runtime,
		reference,
		PROCESS_INFO,
		"processName",
		"Ljava/lang/String;",
		createJavaString(runtime, runtime.packageSet.packageName)
	);
	setField(runtime, reference, PROCESS_INFO, "pid", "I", processId(runtime));
	setField(
		runtime,
		reference,
		PROCESS_INFO,
		"importance",
		"I",
		FOREGROUND_IMPORTANCE
	);
}

function processId(runtime) {
	const supplied = Number(runtime.processId);
	return Number.isInteger(supplied) && supplied > 0 ? supplied : 24680;
}

function setField(runtime, reference, type, name, descriptor, value) {
	runtime.heap.setField(
		reference,
		`${type}->${name}:${descriptor}`,
		value
	);
}

function activityManagerError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
