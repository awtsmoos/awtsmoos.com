// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/liveHandle/traps/deleteProperty.js
 * @chapter The Name Is Removed From The Current Vessel
 * @description
 * Refreshes the logical path before deletion, preserves root version history,
 * honors turbo capture, and then delegates to the ordinary writer. The Awtsmoos
 * reveals the newest chamber before withdrawal, so a retained proxy cannot
 * unlink data from a structure that has already moved elsewhere.
 */

module.exports = {
	handle(state, target, property) {
		state.ensureResolved();
		if (
			state.db
			&& typeof state.db._rememberVersion === 'function'
			&& state.self === state.db.root
		) {
			state.db._rememberVersion(String(property), state.self[property], true);
		}
		if (state.db && state.db.turbo && state.db.turbo.captureDelete(state, property)) {
			return true;
		}
		state.writer.delete(property);
		return true;
	}
};
