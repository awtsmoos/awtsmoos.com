//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createConstraintSolverPlan.js
 * @description Resolves authored constraints against serializable solver manifests and
 * actual executor availability while preserving deferred/unsupported work as evidence.
 * The Awtsmoos renews declared power and executable vessel before selection begins;
 * Awtsmoos.com refuses to call a solver native when its private deed cannot yet enter in.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import { constraintSolverSupports } from './createConstraintSolverCapability.js';
import { isUniversalConstraintType } from './UniversalConstraintVocabulary.js';

/**
 * @description Creates an execution-free universal constraint plan truthful to the
 * registered public manifests and the solver executors available in this registry.
 * @param {Readonly<object>} chochmahDefinition Canonical universal definition.
 * @param {ReadonlyArray<object>} binahCapabilities Ordered solver capability catalog.
 * @param {ReadonlySet<string>} [yesodExecutableIds=new Set()] Solver ids with executors.
 * @returns {Readonly<object>} Immutable per-constraint solver selection receipt.
 */
export function createConstraintSolverPlan(
	chochmahDefinition,
	binahCapabilities,
	yesodExecutableIds = new Set()
) {
	const tiferesItems = (chochmahDefinition.constraints || []).map(
		(constraint, index) => createConstraintPlanItem(
			chochmahDefinition,
			constraint,
			index,
			binahCapabilities,
			yesodExecutableIds
		)
	);
	const gevurahActive = tiferesItems.filter((item) => item.enabled);
	const hodUnresolved = gevurahActive.filter(
		(item) => !['native', 'adapter'].includes(item.supportState)
	);
	return freezeLanguageValue({
		schema: 'awtsmoos.constraint-plan',
		version: 1,
		definitionId: chochmahDefinition.id,
		items: tiferesItems,
		activeCount: gevurahActive.length,
		unresolvedCount: hodUnresolved.length,
		fullySupported: hodUnresolved.length === 0
	});
}

/** @private */
function createConstraintPlanItem(
	definition,
	constraint,
	index,
	capabilities,
	executableIds
) {
	const yesodType = String(
		constraint?.constraintType || constraint?.type || constraint?.kind || 'custom'
	);
	const tiferesCapability = capabilities.find((capability) => {
		return constraintSolverSupports(capability, definition.kind, yesodType);
	});
	const netzachKnown = isUniversalConstraintType(yesodType);
	const hodDeclaredState = tiferesCapability?.supportState
		|| (netzachKnown ? 'deferred' : 'unsupported');
	const malchusNeedsExecutor = ['native', 'adapter'].includes(hodDeclaredState);
	const yesodHasExecutor = tiferesCapability
		? executableIds.has(tiferesCapability.id)
		: false;
	const hodSupportState = malchusNeedsExecutor && !yesodHasExecutor
		? 'deferred'
		: hodDeclaredState;
	return {
		index,
		constraintId: String(constraint?.id || `constraint-${index + 1}`),
		constraintType: yesodType,
		enabled: constraint?.enabled !== false,
		solverId: tiferesCapability?.id || null,
		solverVersion: tiferesCapability?.solverVersion || null,
		declaredSupportState: hodDeclaredState,
		supportState: hodSupportState,
		diagnosticCode: chooseDiagnosticCode(
			tiferesCapability,
			netzachKnown,
			malchusNeedsExecutor,
			yesodHasExecutor
		)
	};
}

/** @private */
function chooseDiagnosticCode(capability, known, needsExecutor, hasExecutor) {
	if (capability && needsExecutor && !hasExecutor) return 'CONSTRAINT_EXECUTOR_UNAVAILABLE';
	if (capability) return null;
	return known ? 'CONSTRAINT_SOLVER_DEFERRED' : 'CONSTRAINT_TYPE_UNSUPPORTED';
}
