// B"H
// Boruch Hashem
// Blessed is He
/** @module WorldValidation @description Validates reachability and structural publication requirements. */
import { validationFailure, validationIssue, validationSuccess } from '../core/validationResult.mjs';

/** Validates a world draft before immutable publication. */
export function validateWorldDraft(world, options = {}) {
	const errors = [];
	const warnings = [];
	if (world?.type !== 'world' || world?.state !== 'draft') {
		errors.push(validationIssue('$', 'World validation requires a draft world.', 'not-world-draft'));
	}
	if (!world?.payload?.spawn) {
		errors.push(validationIssue('$.payload.spawn', 'World requires a spawn point.', 'missing-spawn'));
	}
	if (!(world?.payload?.entities || []).length) {
		warnings.push(validationIssue('$.payload.entities', 'World has no entities.', 'empty-world'));
	}
	if (options.requireMission && !(world?.payload?.missions || []).length) {
		errors.push(validationIssue('$.payload.missions', 'World requires a mission.', 'missing-mission'));
	}
	if (typeof options.reachabilityCheck === 'function' && !options.reachabilityCheck(world)) {
		errors.push(validationIssue('$.payload', 'World reachability check failed.', 'unreachable'));
	}
	return errors.length ? validationFailure(errors, warnings) : validationSuccess(world, warnings);
}
