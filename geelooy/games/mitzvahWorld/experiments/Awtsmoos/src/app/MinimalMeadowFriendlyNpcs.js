// B"H
// Boruch Hashem
// Blessed is He

/** Installs the optional friendly actor family without replacing an essential quest roster. */
import {
	installMinimalMeadowFriendlyChossids
} from './MinimalMeadowFriendlyChossidSystem.js';

export async function installMinimalMeadowFriendlyNpcs(runtime) {
	if (runtime.friendlyNpcs) {
		return runtime.friendlyNpcs.diagnostics?.() || { ready: true };
	}
	return installMinimalMeadowFriendlyChossids(runtime);
}

export default installMinimalMeadowFriendlyNpcs;
