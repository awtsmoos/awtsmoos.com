// B"H

import { policyFromDocument, continuationOf } from "./model.js";
import { renderAgentControls } from "./render.js";

export function createAgentControls(state, api, setStatus) {
	const controls = {
		render,
		refresh,
		preset,
		save,
		pause: () => perform("missionTurnPause"),
		resume: () => perform("missionTurnResume"),
		once: () => perform("missionTurnOnce"),
		drain: () => perform("missionTurnDrain"),
		stop: () => perform("missionTurnStop")
	};

	function render() {
		renderAgentControls(state, {
			...controls,
			busy: Boolean(state.turnBusy)
		});
	}

	async function refresh() {
		if (!state.selectedMissionId || state.turnBusy) return;
		state.turnBusy = true;
		state.turnError = "";
		render();
		try {
			const missionId = state.selectedMissionId;
			const [status, resources] = await Promise.all([
				api({ action: "missionTurnStatus", missionId }),
				api({ action: "missionResourceStatus", missionId })
			]);
			apply(status);
			state.resourceStatus = resources;
		} catch (error) {
			fail(error);
		} finally {
			state.turnBusy = false;
			render();
		}
	}

	async function preset(name) {
		return perform("missionTurnSet", { policy: { preset: name } });
	}

	async function save() {
		const current = continuationOf(state);
		return perform("missionTurnSet", {
			policy: policyFromDocument(current)
		});
	}

	async function perform(action, extra = {}) {
		if (!state.selectedMissionId || state.turnBusy) return;
		state.turnBusy = true;
		state.turnError = "";
		render();
		try {
			const missionId = state.selectedMissionId;
			const current = continuationOf(state);
			const result = await api({
				action,
				missionId,
				expectedRevision: current.revision,
				actor: "tunnel-control-human",
				...extra
			});
			apply(result);
			state.resourceStatus = await api({ action: "missionResourceStatus", missionId });
			setStatus?.(`${action} applied to ${missionId}.`);
		} catch (error) {
			fail(error);
		} finally {
			state.turnBusy = false;
			render();
		}
	}

	function apply(result = {}) {
		if (result.continuation) state.continuation = result.continuation;
		if (result.presets) state.continuationPresets = result.presets;
	}

	function fail(error) {
		state.turnError = error?.message || String(error);
		setStatus?.(state.turnError);
	}

	return controls;
}
