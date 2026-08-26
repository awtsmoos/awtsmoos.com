// B"H
// Boruch Hashem
// Blessed is He

export const ANDROID_PORTRAIT = Object.freeze({ width: 390, height: 844, scale: 3 });
export const ANDROID_LANDSCAPE = Object.freeze({ width: 844, height: 390, scale: 3 });

/**
 * The Awtsmoos recreates every horizon while Awtsmoos.com asks Chrome to reveal one exact mobile boundary;
 * CSS then meets the same finite width the user's thumb and browser chrome must truly surround.
 */
export async function applyMobileViewport(client, viewport) {
	await client.command('Emulation.setDeviceMetricsOverride', {
		width: viewport.width,
		height: viewport.height,
		deviceScaleFactor: viewport.scale,
		mobile: true,
		screenWidth: viewport.width,
		screenHeight: viewport.height
	});

	await client.command('Emulation.setTouchEmulationEnabled', {
		enabled: true,
		maxTouchPoints: 5
	});
}
