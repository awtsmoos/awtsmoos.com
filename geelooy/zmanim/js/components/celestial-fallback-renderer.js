//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond fallback and enhancement while every created body receives a visible vessel when GPU light is absent;
 * Awtsmoos.com keeps stars, sun, moon, and optical ghosts in one small DOM renderer whose truth remains tied to the celestial scene present.
 */

/** Build the complete non-WebGL celestial body layer from one renderer-neutral scene. */
export function renderCelestialFallback(scene) {
	const fallback = document.createElement("div");
	fallback.className = "celestial-fallback-layer";
	fallback.append(renderStars(scene), renderFlare(scene));
	if (scene.sun.altitudeDegrees >= -1.5) {
		fallback.append(renderSun(scene.sun));
	}
	if (scene.moon.altitudeDegrees >= -0.7) {
		fallback.append(renderMoon(scene.moon));
	}
	return fallback;
}

/** Render the real bright-star catalog with daylight and horizon attenuation. */
function renderStars(scene) {
	const field = document.createElement("div");
	field.className = "celestial-stars";
	const darkness = Math.max(0, Math.min(1, (-scene.sun.altitudeDegrees + 2) / 12));
	for (const star of scene.stars) {
		const point = document.createElement("span");
		const horizon = Math.max(0, Math.min(1, (star.altitudeDegrees + 3) / 14));
		point.className = "celestial-star";
		point.title = `${star.name} · alt ${star.altitudeDegrees.toFixed(1)}°`;
		point.style.left = `${star.x * 100}%`;
		point.style.top = `${star.y * 100}%`;
		point.style.opacity = String(darkness * horizon * Math.max(0.24, 1.1 - (star.magnitude + 1.5) / 4));
		point.style.setProperty("--star-size", `${Math.max(1.3, 3.4 - star.magnitude)}px`);
		field.append(point);
	}
	return field;
}

/** Render the CSS solar disc fallback at the calculated local projection. */
function renderSun(sun) {
	const body = document.createElement("span");
	body.className = "celestial-sun";
	positionBody(body, sun);
	body.title = `Sun · alt ${sun.altitudeDegrees.toFixed(1)}° · az ${sun.azimuthDegrees.toFixed(1)}°`;
	return body;
}

/** Render the CSS moon fallback with phase-dependent shadow translation. */
function renderMoon(moon) {
	const body = document.createElement("span");
	const direction = moon.phase.waxing ? -1 : 1;
	body.className = "celestial-moon";
	body.dataset.waxing = String(moon.phase.waxing);
	positionBody(body, moon);
	body.style.setProperty("--moon-shadow-shift", `${direction * moon.phase.illuminatedFraction * 100}%`);
	body.title = `${moon.phase.name} · ${(moon.phase.illuminatedFraction * 100).toFixed(0)}% illuminated`;
	return body;
}

/** Render bounded optical ghosts only when the calculated flare plan is visible. */
function renderFlare(scene) {
	const layer = document.createElement("div");
	layer.className = "celestial-flare";
	for (const ghost of scene.lensFlare.visible ? scene.lensFlare.ghosts : []) {
		const point = document.createElement("span");
		point.style.left = `${ghost.x * 100}%`;
		point.style.top = `${ghost.y * 100}%`;
		point.style.width = `${ghost.size * 100}%`;
		point.style.opacity = String(ghost.alpha);
		layer.append(point);
	}
	return layer;
}

/** Place one celestial body using normalized panoramic scene coordinates. */
function positionBody(body, celestialBody) {
	body.style.left = `${celestialBody.x * 100}%`;
	body.style.top = `${celestialBody.y * 100}%`;
}
