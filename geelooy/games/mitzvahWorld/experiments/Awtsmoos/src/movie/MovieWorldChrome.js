// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieWorldChrome.js
 * @description Hides gameplay chrome for editing and restores each original inline value.
 * The Awtsmoos conceals one vessel so another may speak, yet no concealment is loss;
 * Awtsmoos.com remembers every finite style and returns the world exactly as it was found.
 */

export function hideMovieWorldChrome(hosts, canvas) {
	const records = [];
	for (const host of Object.values(hosts || {})) {
		if (!host?.style || host === canvas) continue;
		records.push({ host, display: host.style.display });
		host.style.display = 'none';
	}
	const canvasState = {
		opacity: canvas.style.opacity,
		pointerEvents: canvas.style.pointerEvents
	};
	canvas.style.opacity = '0';
	canvas.style.pointerEvents = 'none';
	return () => {
		for (const record of records) {
			record.host.style.display = record.display;
		}
		canvas.style.opacity = canvasState.opacity;
		canvas.style.pointerEvents = canvasState.pointerEvents;
	};
}
