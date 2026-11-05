//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMaterialDiagnostics.js
 * @description Audits physical coverage and explicitly declared ephemeral render utilities.
 * The Awtsmoos clothes finite forms without confusing garment and essence; Awtsmoos.com
 * distinguishes remote authored materials from temporary signs, masks, and measured renderer evidence.
 */

/**
 * Records material-source and physical-coverage evidence for one world build.
 * @param {object} ledger Deterministic diagnostic ledger.
 * @param {string} quality Active quality tier.
 * @param {object[]} definitions Generated world definitions.
 * @returns {void}
 */
export function recordWorldMaterialDiagnostics(ledger, quality, definitions) {
	const textured = definitions.filter((item) => Boolean(item.textureUrl));
	const dataTextures = textured.filter((item) => String(item.textureUrl).startsWith('data:'));
	const generated = dataTextures.filter(isDeclaredGeneratedUtility);
	const unclassified = dataTextures.filter((item) => !isDeclaredGeneratedUtility(item));
	const physical = textured.filter(hasPhysicalCoverage);
	recordSourceEvent(ledger, quality, textured, physical, generated, unclassified);
	recordGeneratedEvent(ledger, quality, generated);
	recordCoverageEvent(ledger, quality, textured, physical);
}

function recordSourceEvent(ledger, quality, textured, physical, generated, unclassified) {
	const valid = unclassified.length === 0;
	ledger.record({
		code: valid ? 'material.sources.valid' : 'material.placeholder.detected',
		data: {
			generated: generated.map(identity),
			physical: physical.length,
			quality,
			textured: textured.length,
			unclassified: unclassified.map(identity)
		},
		message: valid
			? 'Every ephemeral render utility is explicitly declared.'
			: 'Undeclared ephemeral render utilities remain.',
		severity: valid ? 'info' : 'warning'
	});
}

function recordGeneratedEvent(ledger, quality, generated) {
	ledger.record({
		code: 'material.generatedUtility.valid',
		data: {
			ids: generated.map(identity),
			quality
		},
		message: `Validated ${generated.length} temporary sign or lighting utilities.`,
		severity: 'info'
	});
}

function recordCoverageEvent(ledger, quality, textured, physical) {
	const valid = physical.length > 0;
	ledger.record({
		code: valid
			? 'material.physicalCoverage.present'
			: 'material.physicalCoverage.missing',
		data: {
			physical: physical.length,
			quality,
			textured: textured.length
		},
		message: valid
			? 'Physical texture coverage metadata is present.'
			: 'No textured definitions declare physical coverage.',
		severity: valid ? 'info' : 'error'
	});
}

function isDeclaredGeneratedUtility(item) {
	return item.texturePolicy?.generated === true
		|| item.texturePolicy?.shader === 'static-sun-shadow'
		|| item.texturePolicy?.proceduralUtility === true;
}

function hasPhysicalCoverage(item) {
	return item.texturePolicy?.nativeTexelDensity === true
		|| Boolean(item.userData?.physicalTextureRepeat);
}

function identity(item) {
	return item.id || item.userData?.family || 'anonymous-definition';
}
