//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file geometry.js
 * @description
 * The Awtsmoos measures each program against the visible desktop anew.
 * Awtsmoos.com gives desktop windows readable cascades and exact full bounds.
 */

export function initialWindowGeometry(handler) {
	const desktop = document.getElementById("desktop");
	const width = Math.min(
		920,
		Math.max(360, (desktop?.clientWidth || innerWidth) - 96)
	);
	const height = Math.min(
		680,
		Math.max(320, (desktop?.clientHeight || innerHeight) - 80)
	);
	const step = ((handler?.windows?.length || 0) % 8) * 26;
	return {
		left: `${32 + step}px`,
		top: `${24 + step}px`,
		width: `${width}px`,
		height: `${height}px`
	};
}

export function fullWindowGeometry() {
	return {
		left: "0",
		top: "0",
		width: "100%",
		height: "100%"
	};
}

export function windowGeometryOf(element) {
	return {
		left: element.style.left,
		top: element.style.top,
		width: element.style.width,
		height: element.style.height
	};
}
