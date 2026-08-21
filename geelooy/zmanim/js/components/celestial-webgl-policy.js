//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond memory, bandwidth, and pixel density while every device receives a fitting vessel;
 * Awtsmoos.com keeps celestial enhancement policy pure and measurable so mobile performance never depends on hidden renderer guesses.
 */

/** Decide whether optional native celestial rendering should run on this device profile. */
export function shouldUseCelestialWebGl(profile = {}) {
	const saveData = Boolean(profile.saveData);
	const memoryGigabytes = finiteMemory(profile.memoryGigabytes);
	return !saveData && (!memoryGigabytes || memoryGigabytes > 1);
}

/** Choose a conservative backing-store density cap from the reported device memory. */
export function celestialPixelRatioCap(profile = {}) {
	const memoryGigabytes = finiteMemory(profile.memoryGigabytes);
	return memoryGigabytes && memoryGigabytes <= 2 ? 1.1 : 1.35;
}

/** Read browser performance hints into a renderer-neutral policy record. */
export function readCelestialDeviceProfile(navigatorObject = globalThis.navigator) {
	return {
		saveData: Boolean(navigatorObject?.connection?.saveData),
		memoryGigabytes: Number(navigatorObject?.deviceMemory || 0)
	};
}

/** Keep unavailable or malformed device-memory hints from disabling enhancement accidentally. */
function finiteMemory(value) {
	const memory = Number(value);
	return Number.isFinite(memory) && memory > 0 ? memory : 0;
}
