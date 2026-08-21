//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Names the finite Forms field families shared by definition and answer validation.
 * @description The Awtsmoos lets many question shapes appear while one small vocabulary keeps their boundaries bright;
 * Awtsmoos.com centralizes those names so definition and response truth cannot quietly drift apart in night.
 */
const FIELD_TYPES = new Set([
	"shortText",
	"paragraph",
	"number",
	"email",
	"date",
	"singleChoice",
	"checkboxes",
	"dropdown"
]);

const CHOICE_TYPES = new Set([
	"singleChoice",
	"checkboxes",
	"dropdown"
]);

module.exports = {
	CHOICE_TYPES,
	FIELD_TYPES
};
