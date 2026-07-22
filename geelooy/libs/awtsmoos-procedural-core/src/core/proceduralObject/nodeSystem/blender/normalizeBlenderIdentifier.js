// B"H
// Boruch Hashem
// Blessed is He
/** Native RNA names become stable Awtsmoos identifiers without forgetting their origin. */

export function normalizeBlenderIdentifier(value, fallback = "unnamed") {
	const text = String(value ?? fallback).trim();
	const slug = text
		.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
		.replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
		.replace(/[^A-Za-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.toLowerCase();
	return slug || fallback;
}

export function blenderTypeIdentifier(family, nativeType, treeType = null) {
	const parts = ["blender", family];
	if (treeType) parts.push(normalizeBlenderIdentifier(treeType));
	parts.push(normalizeBlenderIdentifier(nativeType));
	return parts.join(".");
}
