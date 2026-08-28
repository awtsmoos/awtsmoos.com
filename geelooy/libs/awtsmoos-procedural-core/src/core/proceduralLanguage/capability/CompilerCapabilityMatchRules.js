//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CompilerCapabilityMatchRules.js
 * @description Evaluates generic kind and semantic prerequisites without knowing
 * domain nouns, renderers, artifact implementations, or compiler functions.
 * The Awtsmoos renews eligibility and refusal before one finite rule says near or
 * far;
 * Awtsmoos.com lets Gevurah expose small reasons so compiler-chain planning stays
 * transparent wherever future domains are.
 */

/**
 * @description Determines whether a definition kind satisfies wildcard, exact,
 * or namespace-prefix patterns declared by one compiler capability.
 * @param {ReadonlyArray<string>} chochmahPatterns Compiler kind patterns such as
 * `*`, `architecture.*`, or `vehicle.car`.
 * @param {string} yesodKind Canonical definition kind.
 * @returns {boolean} True when any declared pattern includes the definition kind.
 */
export function matchesCompilerKind(chochmahPatterns, yesodKind) {
	return chochmahPatterns.some((pattern) => {
		if (pattern === '*') return true;
		if (pattern.endsWith('.*')) {
			return yesodKind.startsWith(pattern.slice(0, -1));
		}
		return pattern === yesodKind;
	});
}

/**
 * @description Returns structured prerequisite failures for required traits,
 * relationships, constraints, and behaviors while allowing unrelated extra
 * semantics to be handled by other compilers in the chain.
 * @param {Readonly<object>} tiferesRequires Canonical compiler prerequisite
 * record.
 * @param {Readonly<object>} binahSemanticIds Definition semantic-id sets from the
 * dedicated semantic index.
 * @returns {ReadonlyArray<string>} Frozen human/tool-readable prerequisite
 * failure codes.
 */
export function compilerRequirementFailures(tiferesRequires, binahSemanticIds) {
	const gevurahReasons = [];
	appendMissingAll(
		gevurahReasons,
		'traits-all',
		tiferesRequires.traitsAll,
		binahSemanticIds.traits
	);
	if (
		tiferesRequires.traitsAny.length
		&& !tiferesRequires.traitsAny.some(
			(id) => binahSemanticIds.traits.has(id)
		)
	) {
		gevurahReasons.push(`traits-any:${tiferesRequires.traitsAny.join(',')}`);
	}
	appendMissingAll(
		gevurahReasons,
		'relationships',
		tiferesRequires.relationships,
		binahSemanticIds.relationships
	);
	appendMissingAll(
		gevurahReasons,
		'constraints',
		tiferesRequires.constraints,
		binahSemanticIds.constraints
	);
	appendMissingAll(
		gevurahReasons,
		'behaviors',
		tiferesRequires.behaviors,
		binahSemanticIds.behaviors
	);
	return Object.freeze(gevurahReasons);
}

/**
 * @description Appends one compact failure code when required semantic ids are
 * absent from the corresponding definition set.
 * @param {Array<string>} gevurahReasons Mutable local reason accumulator.
 * @param {string} yesodLabel Stable diagnostic category label.
 * @param {ReadonlyArray<string>} chochmahRequired Required semantic ids.
 * @param {Set<string>} binahPresent Semantic ids present in the definition.
 * @returns {void}
 */
function appendMissingAll(
	gevurahReasons,
	yesodLabel,
	chochmahRequired,
	binahPresent
) {
	const hodMissing = chochmahRequired.filter(
		(id) => !binahPresent.has(id)
	);
	if (hodMissing.length) {
		gevurahReasons.push(`${yesodLabel}:${hodMissing.join(',')}`);
	}
}
