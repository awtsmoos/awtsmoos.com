// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Provides the shared readable runtime for legacy mission action families.
 * @description
 * The Awtsmoos lets one outer transaction guard the mission while Awtsmoos.com keeps each
 * action helper small and explicit; load, reveal, save, and report happen without a second
 * private mutex whose retained promises could silently accumulate behind the ordered light.
 */
function createMissionActionRuntime(dependencies) {
	const {
		config,
		payload,
		M,
		X,
		S,
		L,
		C,
		K,
		PS,
		P
	} = dependencies;

	function mid(value = {}) {
		return value.missionId || value.id || value.target || "";
	}

	async function use(runtimeConfig, runtimePayload, operation) {
		const missionId = mid(runtimePayload);
		const mission = await M.load(runtimeConfig, missionId);
		if (!mission) {
			return {
				ok: false,
				action: runtimePayload.action,
				error: "mission_not_found",
				missionId
			};
		}
		const output = await operation(mission);
		await M.save(runtimeConfig, mission);
		return output;
	}

	function nxt(mission, value = {}) {
		return M.nextStep(mission, {
			auto: value.auto === true || value.auto === "true" ||
				mission.automation?.enabled
		});
	}

	function withNext(output, mission, value) {
		return {
			...output,
			next: output.next || nxt(mission, value),
			mission: M.report(mission)
		};
	}

	function metaPayload(value = {}, runtimeConfig = {}) {
		return {
			...value,
			__configRoot: runtimeConfig.root,
			__metadataRoot: runtimeConfig.metadataRoot
		};
	}

	function matchesProject(mission, value = {}) {
		const query = String(
			value.q || value.query || value.projectRoot || value.root ||
			value.directory || ""
		).toLowerCase();
		if (!query) return true;
		const room = C.ensure(mission);
		const metadata = mission.metadata || {};
		return [
			mission.id,
			mission.goal,
			room.projectRoot,
			metadata.projectRoot,
			metadata.root,
			metadata.directory,
			metadata.project
		]
			.map(item => String(item || "").toLowerCase())
			.filter(Boolean)
			.some(item => item.includes(query) || query.includes(item));
	}

	return {
		config, payload, M, X, S, L, C, K, PS, P,
		mid, nxt, use, withNext, metaPayload, matchesProject
	};
}

module.exports = {
	createMissionActionRuntime
};
