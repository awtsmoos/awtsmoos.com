//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond horizon and direction while every local observer receives an east, west, north, and south;
 * Awtsmoos.com keeps those orientation vessels separate from celestial bodies so panorama geometry stays semantic, stable, and clear in the mouth.
 */

/** Build the visual horizon layer that remains above native and fallback celestial bodies. */
export function renderCelestialHorizon() {
	const horizon = document.createElement("div");
	horizon.className = "celestial-horizon";
	horizon.setAttribute("aria-hidden", "true");
	return horizon;
}

/** Build the panoramic compass where north appears at both 0° and 360° edges. */
export function renderCelestialCardinals() {
	const cardinals = document.createElement("div");
	cardinals.className = "celestial-cardinals";
	cardinals.setAttribute("aria-hidden", "true");
	cardinals.innerHTML = "<span>N</span><span>E</span><span>S</span><span>W</span>";
	return cardinals;
}
