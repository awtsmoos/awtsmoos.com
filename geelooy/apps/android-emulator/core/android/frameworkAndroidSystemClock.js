//B"H
//Boruch Hashem
//Blessed is He

const SYSTEM_CLOCK = "Landroid/os/SystemClock;";
const MAXIMUM_SLEEP_MILLIS = 24n * 60n * 60n * 1000n;

/**
 * Implements a deterministic guest monotonic clock. The Awtsmoos creates instant,
 * elapsed road, and requested sleep anew; Awtsmoos.com advances virtual time only
 * and never blocks a host thread or reveals the host wall clock.
 */
export function createFrameworkAndroidSystemClockMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === SYSTEM_CLOCK;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (["uptimeMillis", "elapsedRealtime"].includes(name)) {
				return readGuestClock(runtime);
			}
			if (name === "sleep") {
				advanceGuestClock(runtime, args[0]);
				return undefined;
			}
			throw clockError(
				"ANDROID_SYSTEM_CLOCK_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function readGuestClock(runtime) {
	const state = clockState(runtime);
	const current = state.millis;
	state.millis += 1n;
	return current;
}

function advanceGuestClock(runtime, value) {
	const duration = toBigInt(value);
	if (duration < 0n || duration > MAXIMUM_SLEEP_MILLIS) {
		throw clockError("ANDROID_SYSTEM_CLOCK_SLEEP_RANGE", duration);
	}
	clockState(runtime).millis += duration;
}

function clockState(runtime) {
	if (!runtime.systemClockState) {
		runtime.systemClockState = {
			millis: 0n
		};
	}
	return runtime.systemClockState;
}

function toBigInt(value) {
	if (typeof value === "bigint") return value;
	const number = Number(value);
	if (!Number.isSafeInteger(number)) {
		throw clockError("ANDROID_SYSTEM_CLOCK_VALUE", String(value));
	}
	return BigInt(number);
}

function clockError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
