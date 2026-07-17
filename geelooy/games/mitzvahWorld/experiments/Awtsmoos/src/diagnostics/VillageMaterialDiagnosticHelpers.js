// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageMaterialDiagnosticHelpers.js
 * @description Names and classifies live village material evidence without false alarms.
 * The Awtsmoos distinguishes stone from shadow and parchment from plaster; Awtsmoos.com
 * audits physical garments while exempting intentional masks, text, cards, and procedural light.
 */

const COTTAGE_PATTERN = /cottage|house|village-district|functional-house|roof/i;
const PHYSICAL_PATTERN = /bridge|cottage|door|foundation|house|market|roof|shul|stone|timber|wall|wood/i;
const EXEMPT_PATTERN = /(?:decal|glyph|icon|label|mask|procedural-text|shadow|sign-card|sun-shadow|text-landmark)/i;

export function materialIdentity(object, material) {
	return [
		object.name,
		object.userData?.family,
		object.userData?.part,
		material.name,
		material.texturePolicy?.role
	].filter(Boolean).join(' ');
}

export function materialClassification(identity, material) {
	const exempt = isDiagnosticExemption(identity, material);
	return {
		cottage: !exempt && COTTAGE_PATTERN.test(identity),
		exempt,
		physical: !exempt && (
			material.texturePolicy?.nativeTexelDensity === true
			|| material.texturePolicy?.originalPixelsOnly === true
			|| PHYSICAL_PATTERN.test(identity)
		)
	};
}

export function usableMaterialImage(image) {
	return Boolean(
		image
		&& image.complete !== false
		&& imageWidth(image) > 0
		&& imageHeight(image) > 0
	);
}

export function nearWhiteMaterial(color = []) {
	return (color[0] ?? 1) > 0.88
		&& (color[1] ?? 1) > 0.88
		&& (color[2] ?? 1) > 0.88;
}

export function unresolvedMaterialRecord(object, material, url, family) {
	return {
		color: [...(material.color || [])],
		fallback: material.mapImageFallback === true,
		family,
		material: material.name || '(unnamed-material)',
		mesh: object.name || '(unnamed-mesh)',
		reason: url ? 'image-not-ready' : 'missing-http-texture-url',
		textureUrl: url || null
	};
}

export function emptyMaterialSummary() {
	return {
		cottagePending: 0,
		cottageReady: 0,
		cottageSurfaces: 0,
		exemptSurfaces: 0,
		fallbackMaps: 0,
		materialSlots: 0,
		missingTextureUrls: 0,
		pendingPhysicalMaps: 0,
		physicalSurfaces: 0,
		readyMaps: 0,
		readyMixMaps: 0,
		whiteUntextured: 0
	};
}

export function emptyMaterialFamily() {
	return {
		cottagePending: 0,
		cottageReady: 0,
		cottageSurfaces: 0,
		exemptSurfaces: 0,
		materialSlots: 0,
		missingTextureUrls: 0,
		pendingPhysicalMaps: 0,
		physicalSurfaces: 0
	};
}

function isDiagnosticExemption(identity, material) {
	const url = String(material.textureUrl || material.mapImage?.src || '');
	if (EXEMPT_PATTERN.test(identity)) return true;
	if (/^data:/i.test(url)) return true;
	return material.texturePolicy?.diagnosticExempt === true;
}

function imageWidth(image) {
	return Number(image?.naturalWidth || image?.videoWidth || image?.width || 0);
}

function imageHeight(image) {
	return Number(image?.naturalHeight || image?.videoHeight || image?.height || 0);
}
