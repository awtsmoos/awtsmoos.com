//B"H
//Boruch Hashem
//Blessed is He

const MAXIMUM_DATE_SECONDS = 8640000000000n;
const STRUCT_TM_BYTES = 56;
const UTC_ZONE = new TextEncoder().encode("UTC\0");

/**
 * Materializes deterministic UTC time in Darwin x86-64 guest memory. The
 * Awtsmoos creates second, calendar fields, static storage, and zone pointer anew;
 * Awtsmoos.com exposes no host timezone, locale object, or mutable Date reference.
 */
export function createDarwinGmtime(options = {}) {
	const maximumCalls = boundedCallLimit(options.maximumTimeCalls);
	const calls = [];
	let structAddress = 0;
	let zoneAddress = 0;
	return Object.freeze({
		handler(context) {
			if (calls.length >= maximumCalls) {
				throw timeError("PORTABLE_TIME_CALL_LIMIT", maximumCalls);
			}
			const pointer = guestAddress(context.registers.get("rdi"));
			const seconds = context.memory.i64BigInt(pointer);
			const date = dateFromSeconds(seconds);
			if (!structAddress) {
				structAddress = context.heap.allocate(STRUCT_TM_BYTES);
				zoneAddress = context.heap.allocate(UTC_ZONE.length);
				context.memory.writeBytes(zoneAddress, UTC_ZONE);
			}
			writeStructTm(context.memory, structAddress, zoneAddress, date);
			calls.push(Object.freeze({
				seconds: seconds.toString(),
				structAddress
			}));
			context.registers.set("rax", structAddress);
		},
		snapshot() {
			return Object.freeze({
				callCount: calls.length,
				calls: Object.freeze(calls.slice(0, 256)),
				structAddress: structAddress || null,
				zoneAddress: zoneAddress || null
			});
		}
	});
}

function writeStructTm(memory, address, zoneAddress, date) {
	memory.writeBytes(address, new Uint8Array(STRUCT_TM_BYTES));
	const view = memory.view(address, STRUCT_TM_BYTES, "write");
	const values = [
		date.getUTCSeconds(),
		date.getUTCMinutes(),
		date.getUTCHours(),
		date.getUTCDate(),
		date.getUTCMonth(),
		date.getUTCFullYear() - 1900,
		date.getUTCDay(),
		yearDay(date),
		0
	];
	values.forEach((value, index) => view.setInt32(index * 4, value, true));
	view.setBigInt64(40, 0n, true);
	view.setBigUint64(48, BigInt(zoneAddress), true);
}

function dateFromSeconds(seconds) {
	if (seconds < -MAXIMUM_DATE_SECONDS || seconds > MAXIMUM_DATE_SECONDS) {
		throw timeError("PORTABLE_TIME_RANGE", seconds);
	}
	const date = new Date(Number(seconds) * 1000);
	if (!Number.isFinite(date.getTime())) throw timeError("PORTABLE_TIME_RANGE", seconds);
	return date;
}

function yearDay(date) {
	const start = new Date(0);
	start.setUTCFullYear(date.getUTCFullYear(), 0, 1);
	start.setUTCHours(0, 0, 0, 0);
	return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

function guestAddress(value) {
	const address = Number(value);
	if (!Number.isSafeInteger(address) || address <= 0) {
		throw timeError("PORTABLE_TIME_POINTER", value);
	}
	return address;
}

function boundedCallLimit(value) {
	const maximum = Number(value ?? 65536);
	if (!Number.isInteger(maximum) || maximum < 1) {
		throw timeError("PORTABLE_TIME_CALL_LIMIT_INVALID", value);
	}
	return maximum;
}

function timeError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
