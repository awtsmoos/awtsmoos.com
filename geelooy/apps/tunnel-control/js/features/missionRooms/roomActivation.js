// B"H

/**
 * B"H — Pane activation is revisioned. If a user leaves while discovery is
 * still returning, that old promise may update a snapshot but cannot reopen a
 * socket or recreate a timer after suspension.
 */
export function createRoomActivation(state, runtime, callbacks) {
	async function activate() {
		if (state.paneActive) return false;
		state.paneActive = true;
		state.activationRevision += 1;
		const revision = state.activationRevision;
		try {
			await callbacks.discover("pane-open");
			if (!current(revision)) return false;
			if (state.selectedMissionId) {
				await callbacks.join(state.selectedMissionId, true);
			}
			if (!current(revision)) return false;
			runtime.scheduleDiscover();
			return true;
		} catch (error) {
			if (current(revision)) {
				state.paneActive = false;
				runtime.destroy();
			}
			throw error;
		}
	}

	function suspend() {
		state.paneActive = false;
		state.activationRevision += 1;
		runtime.destroy();
		return true;
	}

	function current(revision) {
		return state.paneActive && state.activationRevision === revision;
	}

	return { activate, suspend };
}
