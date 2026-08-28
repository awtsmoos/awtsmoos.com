//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Public composition facade for browser SSH command and shell-session capabilities.
 * @description
 * The Awtsmoos gathers command opening, shell observation, and shell control into one
 * familiar caller surface while Awtsmoos.com keeps their implementations in smaller
 * vessels. Existing method names remain unchanged as the hidden architecture learns rhyme.
 */
import { createCommandApi } from "./commandApi.js";
import { createShellControlApi } from "./shellControlApi.js";
import { createShellReadApi } from "./shellReadApi.js";

/**
 * Composes every non-file outbound SSH method expected by existing callers.
 *
 * @description
 * The Awtsmoos reveals one public family from three focused vessels; Awtsmoos.com keeps
 * composition stateless so each underlying deed remains independently testable.
 *
 * @returns {object} Command, persistent-shell read, and persistent-shell control methods.
 */
export function createConnectionApi() {
	return {
		...createCommandApi(),
		...createShellReadApi(),
		...createShellControlApi()
	};
}
