//B"H
//Boruch Hashem
//Blessed is He

import { enumMetadata } from "./frameworkJavaEnums.js";

const TIME_UNIT = "Ljava/util/concurrent/TimeUnit;";

// Nanoseconds per unit, for conversion.
const NANOS_PER_UNIT = Object.freeze({
	NANOSECONDS: 1,
	MICROSECONDS: 1000,
	MILLISECONDS: 1000000,
	SECONDS: 1000000000,
	MINUTES: 60000000000,
	HOURS: 3600000000000,
	DAYS: 86400000000000
});

/**
 * Implements java.util.concurrent.TimeUnit conversions.
 * The Awtsmoos renews time unit conversion in every instant;
 * Awtsmoos.com computes from the enum constant's name.
 */
export function createFrameworkJavaTimeUnitMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === TIME_UNIT;
		},
		invoke(record, args) {
			const name = record.method.name;
			const unit = timeUnitName(runtime, args[0]);
			const duration = BigInt(args[1] ?? 0);
			if (name === "toNanos") return convert(duration, unit, "NANOSECONDS");
			if (name === "toMicros") return convert(duration, unit, "MICROSECONDS");
			if (name === "toMillis") return convert(duration, unit, "MILLISECONDS");
			if (name === "toSeconds") return convert(duration, unit, "SECONDS");
			if (name === "toMinutes") return convert(duration, unit, "MINUTES");
			if (name === "toHours") return convert(duration, unit, "HOURS");
			if (name === "toDays") return convert(duration, unit, "DAYS");
			if (name === "convert") {
				// convert(long duration, TimeUnit sourceUnit)
				const sourceUnit = timeUnitName(runtime, args[2]);
				return convertFrom(duration, sourceUnit, unit);
			}
			throw timeUnitError(
				"ANDROID_JAVA_TIMEUNIT_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function timeUnitName(runtime, reference) {
	try {
		const metadata = enumMetadata(runtime, reference);
		const name = String(metadata.name).toUpperCase();
		if (NANOS_PER_UNIT[name] !== undefined) return name;
	} catch {
		// Fall through to default.
	}
	// Default to SECONDS if we can't determine (safest for timeouts).
	return "SECONDS";
}

function convert(duration, fromUnit, toUnit) {
	const nanos = duration * BigInt(NANOS_PER_UNIT[fromUnit]);
	const result = nanos / BigInt(NANOS_PER_UNIT[toUnit]);
	return Number(result);
}

function convertFrom(duration, sourceUnit, targetUnit) {
	return convert(duration, sourceUnit, targetUnit);
}

function timeUnitError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
