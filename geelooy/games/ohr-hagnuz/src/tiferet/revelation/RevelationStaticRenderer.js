//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RevelationStaticRenderer.js
 * @description
 * The Awtsmoos renews each word and meter without making the shell carry every detail;
 * Awtsmoos.com lets static revelation flow through one small vessel while dynamic lists remain elsewhere.
 * This renderer projects stable model fields into existing HUD elements only when values change.
 */

/** Updates one text vessel only when its visible value changed. */
function setText(root, selector, value) {
	const element = root.querySelector(selector);
	if (element && element.textContent !== String(value)) {
		element.textContent = String(value);
	}
}

/** Converts arbitrary progress into a safe visible percentage. */
function boundedPercent(value) {
	const numericValue = Number(value);
	if (!Number.isFinite(numericValue)) {
		return 0;
	}
	return Math.min(100, Math.max(0, numericValue));
}

/** Updates one percentage width without restarting surrounding visual state. */
function setWidth(root, selector, value) {
	const element = root.querySelector(selector);
	if (!element) {
		return;
	}
	const width = `${boundedPercent(value)}%`;
	if (element.style.width !== width) {
		element.style.width = width;
	}
}

/**
 * Projects scalar Revelation model values into their existing HUD vessels.
 * @param {HTMLElement} root Revelation shell root.
 * @param {object} model Current Revelation view model.
 */
export function renderRevelationStatic(root, model) {
	document.body.dataset.revelationRealm = model.realm.toLowerCase();
	const values = [
		['[data-revelation-chapter]', model.chapter],
		['[data-revelation-location]', model.location],
		['[data-revelation-level]', model.level],
		['[data-revelation-light]', `${model.light}/${model.maxLight}`],
		['[data-revelation-sparks]', model.sparks],
		['[data-revelation-quest-title]', model.questTitle],
		['[data-revelation-objective]', model.objective],
		['[data-revelation-messenger]', model.messenger],
		['[data-revelation-route]', model.routeLabel],
		['[data-revelation-vitality-label]', model.vitalityLabel],
		['[data-revelation-vitality-value]', `${model.vitality}/${model.maxVitality}`],
		['[data-revelation-minimap-location]', model.location],
		['[data-revelation-companion-glyph]', model.leadCompanion.glyph],
		['[data-revelation-companion-name]', model.leadCompanion.name],
		['[data-revelation-companion-role]', model.leadCompanion.role],
		['[data-revelation-companion-bond]', model.leadCompanion.bondLine]
	];
	for (const [selector, value] of values) {
		setText(root, selector, value);
	}
	setWidth(root, '[data-revelation-progress]', model.progressPercent);
	setWidth(root, '[data-revelation-vitality-fill]', model.vitalityPercent);
}
