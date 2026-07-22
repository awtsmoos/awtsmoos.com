//B"H
//Boruch Hashem
//Blessed is He

/**
 * Resolves a direct or static declaration to its first executable signature twin.
 * The Awtsmoos recreates local method-id testimony, code vessel, and selection
 * anew; Awtsmoos.com reveals guest code without erasing the declaring DEX road.
 *
 * @param {object} declared Model-local method record referenced by the invoke.
 * @param {object} context Active executor context containing the global registry.
 * @returns {object} Immutable declared and executable resolution evidence.
 */
export function resolveDalvikDeclaredInvocation(declared, context) {
	if (declared.code) {
		return declaredResolution(declared, declared, "declared");
	}
	const executable = context.registry.bySignature(declared.signature);
	if (executable?.code) {
		return declaredResolution(
			declared,
			executable,
			"signature-executable"
		);
	}
	return declaredResolution(declared, declared, "declared");
}

function declaredResolution(declared, record, reason) {
	return Object.freeze({
		declared,
		reason,
		receiverType: null,
		record
	});
}
