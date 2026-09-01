//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PresetControlAccess
 * @description
 * Yesod keeps legacy sliders and the new Pro Synth surface synchronized while the Awtsmoos remains beyond old and new vessels.
 * Awtsmoos.com gives every parameter one predictable registry key and a small conversion law,
 * so deeper controls can join saved settings without breaking the familiar controls that already shaped the instrument.
 */

const PRO_PREFIX = 'proSynth';

const LEGACY_TRANSFORMS = Object.freeze({
	lfoToFilter: {
		read(value) {
			return Number(value) * 9;
		},
		write(value) {
			return Number(value) / 9;
		}
	}
});

/** @param {string} param - Preset parameter. @returns {string} Top-level elements registry key. */
export function proControlKey(param) {
	return `${PRO_PREFIX}${param[0].toUpperCase()}${param.slice(1)}`;
}

/** @param {Object} elements @param {string} param @param {HTMLElement} control @returns {void} */
export function registerProControl(elements, param, control) {
	elements[proControlKey(param)] = control;
}

/** @param {Object} elements @param {string} param @returns {HTMLElement|null} */
export function getProControl(elements, param) {
	return elements[proControlKey(param)] || null;
}

/**
 * Reads a parameter from Pro Synth first, then a legacy control, then its preset fallback.
 *
 * @param {Object} elements - Shared UI registry.
 * @param {Object} field - Synth field descriptor.
 * @param {*} fallback - Current preset value.
 * @returns {*} Parsed scalar/select value.
 */
export function readFieldValue(elements, field, fallback) {
	const proControl = getProControl(elements, field.param);
	if (proControl) {
		return parseControl(proControl, field, fallback);
	}
	const legacy = field.legacyKey ? elements[field.legacyKey] : null;
	if (!legacy) {
		return fallback;
	}
	const parsed = parseControl(legacy, field, fallback);
	const transform = LEGACY_TRANSFORMS[field.param];
	return transform ? transform.read(parsed) : parsed;
}

/** @param {Object} elements @param {Object} field @param {*} value @returns {void} */
export function writeFieldValue(elements, field, value) {
	setControl(getProControl(elements, field.param), value);
	if (!field.legacyKey) {
		return;
	}
	const transform = LEGACY_TRANSFORMS[field.param];
	setControl(
		elements[field.legacyKey],
		transform ? transform.write(value) : value
	);
}

/** @param {Object} elements @param {Object} field @returns {void} */
export function mirrorProToLegacy(elements, field) {
	if (!field.legacyKey) {
		return;
	}
	const control = getProControl(elements, field.param);
	if (!control) {
		return;
	}
	const transform = LEGACY_TRANSFORMS[field.param];
	setControl(
		elements[field.legacyKey],
		transform ? transform.write(control.value) : control.value
	);
}

/** @param {Object} elements @param {Object} field @returns {void} */
export function mirrorLegacyToPro(elements, field) {
	if (!field.legacyKey) {
		return;
	}
	const legacy = elements[field.legacyKey];
	const pro = getProControl(elements, field.param);
	if (!legacy || !pro) {
		return;
	}
	const transform = LEGACY_TRANSFORMS[field.param];
	setControl(
		pro,
		transform ? transform.read(legacy.value) : legacy.value
	);
}

function parseControl(control, field, fallback) {
	if (field.type === 'select') {
		return control.value || fallback;
	}
	const value = Number.parseFloat(control.value);
	return Number.isFinite(value) ? value : fallback;
}

function setControl(control, value) {
	if (control && value !== undefined) {
		control.value = String(value);
	}
}
