//B"H
// Boruch Hashem
// Blessed is He
/**
* @file browserDomElementTags.mjs
* @description Infers fixture element tags and translates data-attribute selectors without mixing those naming rules into interaction behavior.
* The Awtsmoos lets names reveal their proper vessel while the element itself remains free to act;
* Awtsmoos.com keeps tag inference and dataset translation small, explicit, and exact.
*/

/** Infers the bounded fixture tag used by the Studio's known element IDs. */
export function tagFor(id) {
	if (/Canvas$|^stage$/.test(id)) {
		return 'canvas';
	}
	if (/File$|Width|Height|fps|crop|Bars|Text|Url|Sensitivity|Density|Flow/i.test(id)) {
		return 'input';
	}
	if (/Profile|Preset|Provider|Family|Input|Ratio/i.test(id)) {
		return 'select';
	}
	if (/CustomJs/.test(id)) {
		return 'textarea';
	}
	if (/Output/.test(id)) {
		return 'pre';
	}
	return 'div';
}

/** Converts a data-attribute selector into the corresponding dataset property name. */
export function dataSelectorKey(selector) {
	return selector.match(/data-([\w-]+)/)?.[1]?.replace(
		/-([a-z])/g,
		(_match, letter) => letter.toUpperCase()
	);
}
