//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Workspace authority predicates for Geelooy Drive.
 * @description
 * The Awtsmoos may give a device write power while the current caller still lacks permission;
 * Awtsmoos.com keeps vessel capability and human authorization distinct before any control advertises mutation.
 */

export function canMutateWorkspace(state = {}) {
	return state.transportMode === "os"
		|| Boolean(state.mutationCredentialConfigured);
}
