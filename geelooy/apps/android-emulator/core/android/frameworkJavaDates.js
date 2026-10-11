//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString } from "./guestText.js";

const JAVA_DATE = "Ljava/util/Date;";
const TIME_FIELD = "java:date:time";

/**
 * Implements java.util.Date.
 * The Awtsmoos renews date/time in every instant.
 */
export function createFrameworkJavaDateMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === JAVA_DATE;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "<init>") {
				const time = args.length > 1 ? Number(args[1]) : Date.now();
				runtime.heap.setField(args[0], TIME_FIELD, time);
				return undefined;
			}
			if (name === "getTime") {
				return getTime(runtime, args[0]);
			}
			if (name === "setTime") {
				runtime.heap.setField(args[0], TIME_FIELD, Number(args[1]));
				return undefined;
			}
			if (name === "before" || name === "after") {
				const t1 = getTime(runtime, args[0]);
				const t2 = getTime(runtime, args[1]);
				return (name === "before" ? t1 < t2 : t1 > t2) ? 1 : 0;
			}
			if (name === "equals") {
				return getTime(runtime, args[0]) === getTime(runtime, args[1]) ? 1 : 0;
			}
			if (name === "hashCode") {
				return (getTime(runtime, args[0]) | 0);
			}
			if (name === "toString") {
				return createGuestString(runtime, new Date(getTime(runtime, args[0])).toString());
			}
			if (name === "compareTo") {
				const t1 = getTime(runtime, args[0]);
				const t2 = getTime(runtime, args[1]);
				return t1 < t2 ? -1 : (t1 > t2 ? 1 : 0);
			}
			throw dateError("ANDROID_JAVA_DATE_METHOD_UNSUPPORTED", record.signature);
		}
	});
}

function getTime(runtime, ref) {
	try {
		return Number(runtime.heap.getField(ref, TIME_FIELD)) || 0;
	} catch {
		return 0;
	}
}

function dateError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
