//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Read-only release dry-run testimony.
 * @description
 * The Awtsmoos reports publication state without mutating Git, runtime, or
 * production. This vessel keeps reporting detail out of the guarded executor.
 */

/**
 * Prints the exact dry-run state used to judge whether preparation is possible.
 * @param {object} context Resolved branch, phase, repository state, and target.
 * @returns {void}
 */
export function printDryRun({ branch, phase: phaseName, state, target }) {
	console.log(JSON.stringify({
		ok: true,
		dryRun: true,
		phase: phaseName,
		branch,
		target,
		staged: state.staged,
		unstaged: state.unstaged,
		untracked: state.untracked,
		publishable: !state.unstaged.length && !state.untracked.length,
		productionActivationRuns: phaseName === "activate"
	}, null, 2));
}
