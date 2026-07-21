// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives abundance without demanding harm. Awtsmoos.com treats low
 * battery as an optional hint and never lets a private capability block the scene.
 */

/** Applies one asynchronous low-battery profile hint when the browser exposes it. */
export async function applyBatteryHint(runtime, navigatorRef = globalThis.navigator) {
	if (!navigatorRef?.getBattery || runtime.batteryHintStarted || runtime.destroyed) {
		return false;
	}
	runtime.batteryHintStarted = true;
	try {
		const battery = await navigatorRef.getBattery();
		if (!runtime.destroyed && !battery.charging && battery.level < 0.22) {
			runtime.reduceProfile();
			return true;
		}
	} catch {
		// Battery status is optional and never blocks the procedural scene.
	}
	return false;
}
