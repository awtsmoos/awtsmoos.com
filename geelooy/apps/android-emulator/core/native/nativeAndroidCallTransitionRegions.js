//B"H //Boruch Hashem //Blessed be He

const APP_START = 0x100000000n;
const APP_END = 0x200000000n;
const VM_START = 0x1002f0000n;
const VM_END = 0x100306a10n;
const ISOLATE_START = 0x100306a40n;
const ISOLATE_END = 0x1007b2b50n;

/** Creates mutable private transition-space counters for one bounded witness. */
export function createNativeAndroidTransitionCounts() {
	return { appToApp: 0, appToEngine: 0, engineToApp: 0, engineToEngine: 0, other: 0 };
}

/** Classifies one absolute guest address into engine, VM, isolate, or other. */
export function nativeAndroidCodeRegion(address) {
	if (address >= VM_START && address < VM_END) return "vm";
	if (address >= ISOLATE_START && address < ISOLATE_END) return "isolate";
	if (address >= 0n && address < APP_START) return "engine";
	return "other";
}

/** Classifies one absolute address into the broad engine/app accounting spaces. */
export function nativeAndroidBroadSpace(address) {
	if (address >= APP_START && address < APP_END) return "app";
	if (address >= 0n && address < APP_START) return "engine";
	return "other";
}

/** Resolves one broad source→target counter key without fabricating a category. */
export function nativeAndroidBroadKey(source, target) {
	if (source === "engine" && target === "engine") return "engineToEngine";
	if (source === "engine" && target === "app") return "engineToApp";
	if (source === "app" && target === "engine") return "appToEngine";
	if (source === "app" && target === "app") return "appToApp";
	return "other";
}

/** Returns whether a transition crosses the known engine↔VM snapshot boundary. */
export function isNativeAndroidVmBoundary(source, target) {
	return (source === "engine" && target === "vm")
		|| (source === "vm" && target === "engine");
}

/** Capitalizes one stable region token for compact region-count keys. */
export function capitalizeNativeAndroidRegion(value) {
	return `${value[0].toUpperCase()}${value.slice(1)}`;
}
