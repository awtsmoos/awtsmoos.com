//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is One beyond plain page, celestial sky, motion, density, and every visible mode;
 * Awtsmoos.com gives presentation a finite vocabulary so many keilim may differ while the measured zmanim remain on one road.
 */

export const VIEW_MODES = Object.freeze(["plain", "enhanced"]);
export const SKY_MODES = Object.freeze(["off", "css", "webgl"]);
export const THEME_MODES = Object.freeze(["system", "dark", "light"]);
export const DENSITY_MODES = Object.freeze(["comfortable", "compact"]);
export const MOTION_MODES = Object.freeze(["auto", "reduced", "off"]);
export const SECTION_IDS = Object.freeze([
	"next",
	"key",
	"timeline",
	"sky",
	"all",
	"methods"
]);

export const DEFAULT_PRESENTATION = Object.freeze({
	view: "enhanced",
	sky: "webgl",
	theme: "system",
	density: "comfortable",
	motion: "auto",
	sections: SECTION_IDS
});

/** Normalize arbitrary presentation input into one safe finite option record. */
export function normalizePresentationOptions(input = {}) {
	const view = choice(input.view, VIEW_MODES, DEFAULT_PRESENTATION.view);
	const requestedSky = choice(input.sky, SKY_MODES, DEFAULT_PRESENTATION.sky);
	return {
		view,
		sky: view === "plain" ? "off" : requestedSky,
		theme: choice(input.theme, THEME_MODES, DEFAULT_PRESENTATION.theme),
		density: choice(input.density, DENSITY_MODES, DEFAULT_PRESENTATION.density),
		motion: choice(input.motion, MOTION_MODES, DEFAULT_PRESENTATION.motion),
		sections: normalizeSections(input.sections)
	};
}

/** Read only explicitly present presentation overrides from a URL. */
export function readPresentationOverrides(url = currentUrl()) {
	const params = url.searchParams;
	const overrides = {};
	for (const key of ["view", "sky", "theme", "density", "motion"]) {
		if (params.has(key)) {
			overrides[key] = params.get(key);
		}
	}
	if (params.has("sections")) {
		overrides.sections = params.get("sections");
	}
	return overrides;
}

/** Write one normalized presentation record without disturbing calculation parameters. */
export function writePresentationUrl(options, url = currentUrl()) {
	const normalized = normalizePresentationOptions(options);
	for (const key of ["view", "sky", "theme", "density", "motion"]) {
		url.searchParams.set(key, normalized[key]);
	}
	url.searchParams.set("sections", normalized.sections.join(","));
	return url;
}

/** Apply presentation flags to the root element without triggering calculation state. */
export function applyPresentationOptions(options, root = document.documentElement) {
	const normalized = normalizePresentationOptions(options);
	root.dataset.zmanimView = normalized.view;
	root.dataset.zmanimSky = normalized.sky;
	root.dataset.zmanimTheme = normalized.theme;
	root.dataset.zmanimDensity = normalized.density;
	root.dataset.zmanimMotion = normalized.motion;
	for (const section of SECTION_IDS) {
		root.dataset[`zmanimSection${capitalize(section)}`] = normalized.sections.includes(section)
			? "show"
			: "hide";
	}
	return normalized;
}

/** Recover the currently applied root dataset into the same normalized vocabulary. */
export function readAppliedPresentation(root = document.documentElement) {
	return normalizePresentationOptions({
		view: root.dataset.zmanimView,
		sky: root.dataset.zmanimSky,
		theme: root.dataset.zmanimTheme,
		density: root.dataset.zmanimDensity,
		motion: root.dataset.zmanimMotion,
		sections: SECTION_IDS.filter(section => {
			return root.dataset[`zmanimSection${capitalize(section)}`] !== "hide";
		})
	});
}

/** Restrict section selection to canonical ids and retain a useful fallback. */
function normalizeSections(value) {
	const values = Array.isArray(value) ? value : String(value || "").split(",");
	const sections = [...new Set(values.map(item => String(item).trim()).filter(item => {
		return SECTION_IDS.includes(item);
	}))];
	return sections.length ? sections : [...SECTION_IDS];
}

function choice(value, choices, fallback) {
	return choices.includes(String(value || "")) ? String(value) : fallback;
}

function capitalize(value) {
	return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function currentUrl() {
	return new URL(globalThis.location?.href || "https://awtsmoos.com/zmanim/");
}
