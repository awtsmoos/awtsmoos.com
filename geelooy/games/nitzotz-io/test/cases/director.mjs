// B"H
// Boruch Hashem
// Blessed is He
import { runDirectorModeCases } from './directorModes.mjs';
import { runDirectorRuntimeCases } from './directorRuntime.mjs';

/** Gather mode-catalog and live-director witnesses through one stable test import. */
export function runDirectorCases() {
	return [
		...runDirectorModeCases(),
		...runDirectorRuntimeCases()
	];
}
