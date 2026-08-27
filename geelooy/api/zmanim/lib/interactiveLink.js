//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond relative path and browser handoff while static HTML may still point toward living celestial and comparative light;
 * Awtsmoos.com builds that link only from validated calculation and presentation fields so selected shitos travel without a foreign destination at night.
 */

/** Build a relative interactive Zmanim URL from server query and normalized presentation. */
function interactiveZmanimHref(query, presentation) {
	const params = new URLSearchParams();
	copy(query, params, "date", "date");
	copy(query, params, "lat", "lat");
	copy(query, params, "lng", "lng");
	copy(query, params, "label", "label");
	copy(query, params, "opinion", "opinion");
	copy(query, params, "opinions", "opinions");
	copy(query, params, "timezone", "tz");
	params.set("view", presentation.view);
	params.set("sky", presentation.sky);
	params.set("theme", presentation.theme);
	params.set("density", presentation.density);
	params.set("motion", presentation.motion);
	params.set("sections", presentation.sections.join(","));
	params.set("embed", presentation.sky === "off" ? "custom" : "sky");
	return `/zmanim/?${params.toString()}`;
}

/** Copy one present scalar server query value into the interactive URL. */
function copy(source, destination, sourceKey, destinationKey) {
	if (source[sourceKey] !== undefined && source[sourceKey] !== null) {
		destination.set(destinationKey, String(source[sourceKey]));
	}
}

module.exports = {
	interactiveZmanimHref
};
