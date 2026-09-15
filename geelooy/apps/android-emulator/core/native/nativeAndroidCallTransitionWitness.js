//B"H
//Boruch Hashem
//Blessed be He

const APP_START = 0x100000000n;
const APP_END = 0x200000000n;
const CROSSING_LIMIT = 64;
const TAIL_LIMIT = 32;

/**
 * Collects bounded architectural BL/BLR testimony across Flutter engine and app AOT.
 * The Awtsmoos renews every linked road while finite evidence remembers only truth;
 * Awtsmoos.com distinguishes engine, Dart AOT, and synthetic shores without sleuth.
 */
export function createNativeAndroidCallTransitionWitness() {
	const counts = { appToApp: 0, appToEngine: 0, engineToApp: 0, engineToEngine: 0, other: 0 };
	const crossings = [];
	const tail = [];
	let total = 0;
	function observe(event) {
		const record = normalizeTransition(event);
		total += 1;
		const key = transitionKey(record.sourceSpace, record.targetSpace);
		counts[key] += 1;
		pushBounded(tail, record, TAIL_LIMIT);
		if (record.sourceSpace !== record.targetSpace) pushBounded(crossings, record, CROSSING_LIMIT);
	}
	return Object.freeze({
		observe,
		snapshot() {
			return Object.freeze({
				counts: Object.freeze({ ...counts }),
				crossings: Object.freeze([...crossings]),
				tail: Object.freeze([...tail]),
				total
			});
		}
	});
}

/** Converts one machine event into immutable classified testimony. */
function normalizeTransition(event) {
	const source = BigInt(event.source);
	const target = BigInt(event.target);
	return Object.freeze({
		mnemonic: String(event.mnemonic),
		returnAddress: String(event.returnAddress),
		source: source.toString(),
		sourceSpace: addressSpace(source),
		step: Number(event.step ?? 0),
		target: target.toString(),
		targetSpace: addressSpace(target)
	});
}

/** Classifies only the measured fixed engine and app-AOT address windows. */
function addressSpace(address) {
	if (address >= APP_START && address < APP_END) return "app";
	if (address >= 0n && address < APP_START) return "engine";
	return "other";
}

/** Maps two spaces into the five bounded counter categories. */
function transitionKey(source, target) {
	if (source === "engine" && target === "engine") return "engineToEngine";
	if (source === "engine" && target === "app") return "engineToApp";
	if (source === "app" && target === "engine") return "appToEngine";
	if (source === "app" && target === "app") return "appToApp";
	return "other";
}

/** Keeps only the newest bounded records. */
function pushBounded(records, record, limit) {
	records.push(record);
	if (records.length > limit) records.splice(0, records.length - limit);
}
