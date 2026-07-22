// B"H
// Boruch Hashem
// Blessed is He
/** Parity distinguishes representation from native contracts and execution. */

function words(value) {
	return String(value)
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.replace(/^(geometry|shader)node/i, "")
		.toLowerCase()
		.replace(/(node|shader|geometry|bsdf|surface)/g, " ")
		.replace(/[^a-z0-9]+/g, " ")
		.trim()
		.split(/\s+/)
		.filter(Boolean);
}

function score(left, right) {
	const a = new Set(left);
	const b = new Set(right);
	const intersection = [...a].filter((value) => b.has(value)).length;
	const union = new Set([...a, ...b]).size;
	return union ? intersection / union : 0;
}

function bestNativeCandidate(blenderDefinition, nativeDefinitions) {
	const sourceWords = words([
		blenderDefinition.title,
		blenderDefinition.metadata?.nativeType
	].join(" "));
	return nativeDefinitions
		.map((definition) => ({
			definition,
			score: score(sourceWords, words(`${definition.title} ${definition.type}`))
		}))
		.sort((left, right) => right.score - left.score)[0] ?? null;
}

/** Creates per-node representation, native-contract, and executor evidence. */
export function createNativeBlenderParityMatrix(surface, options = {}) {
	const executorRegistry = options.executorRegistry ?? null;
	const nativeDefinitions = surface.nativePack.definitions;
	const rows = surface.blenderPack.definitions.map((definition) => {
		const candidate = bestNativeCandidate(definition, nativeDefinitions);
		const nativeContract = candidate && candidate.score >= 0.45
			? candidate.definition
			: null;
		return Object.freeze({
			blenderType: definition.type,
			nativeType: definition.metadata?.nativeType ?? null,
			treeType: definition.metadata?.treeType ?? null,
			represented: surface.registry.has(definition.type),
			nativeContractType: nativeContract?.type ?? null,
			nativeContractScore: candidate?.score ?? 0,
			executionSupported: executorRegistry?.has?.(definition.type) === true,
			opaque: definition.metadata?.opaque === true
		});
	});
	return Object.freeze({
		rows: Object.freeze(rows),
		counts: Object.freeze({
			total: rows.length,
			represented: rows.filter((row) => row.represented).length,
			nativeContracts: rows.filter((row) => row.nativeContractType).length,
			executable: rows.filter((row) => row.executionSupported).length,
			opaque: rows.filter((row) => row.opaque).length
		}),
		missingRepresentation: Object.freeze(rows
			.filter((row) => !row.represented)
			.map((row) => row.blenderType)),
		missingNativeContracts: Object.freeze(rows
			.filter((row) => !row.nativeContractType)
			.map((row) => row.blenderType)),
		missingExecution: Object.freeze(rows
			.filter((row) => !row.executionSupported)
			.map((row) => row.blenderType))
	});
}
