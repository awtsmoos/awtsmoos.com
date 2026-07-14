// B"H
// Boruch Hashem
// Blessed is He
/** @module ReplayVerification @description Verifies sequence continuity and runtime compatibility. */
import { validationFailure, validationIssue, validationSuccess } from '../core/validationResult.mjs';

/** Verifies replay events against a manifest and runtime version. */
export function verifyReplay(manifest, events, options = {}) {
	const errors = [];
	if (options.runtimeVersion && manifest?.runtimeVersion !== options.runtimeVersion) {
		errors.push(validationIssue('$.runtimeVersion', 'Replay runtime version differs.', 'runtime-mismatch'));
	}
	for (let index = 0; index < events.length; index += 1) {
		if (events[index].sequence !== index) {
			errors.push(validationIssue(`$.events[${index}].sequence`, 'Replay sequence is not contiguous.', 'sequence-gap'));
			break;
		}
		if (index > 0 && events[index].timeMs < events[index - 1].timeMs) {
			errors.push(validationIssue(`$.events[${index}].timeMs`, 'Replay time moved backward.', 'time-regression'));
			break;
		}
	}
	if (typeof options.simulate === 'function' && !options.simulate(manifest, events)) {
		errors.push(validationIssue('$.events', 'Deterministic simulation failed.', 'simulation-failed'));
	}
	return errors.length ? validationFailure(errors) : validationSuccess({ manifest, events });
}
