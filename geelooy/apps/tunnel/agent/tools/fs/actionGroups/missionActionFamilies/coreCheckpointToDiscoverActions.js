// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts core mission actions from missionCheckpoint through missionDiscover.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildCoreCheckpointToDiscoverActions(runtime) {
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
		P,
		mid,
		nxt,
		use,
		withNext,
		metaPayload,
		matchesProject
	} = runtime;
	return {
		async missionCheckpoint(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionCheckpoint',
						checkpoint:M.checkpoint(m,
						payload)
					},
					m,
					payload));
		},
		async missionSelfMailDraft(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionSelfMailDraft',
						mail:M.selfMailDraft(m,
						payload)
					},
					m,
					payload));
		},
		async missionBrainstorm(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionBrainstorm',
						brainstorm:M.brainstorm(m,
						payload),
						expansion:X.expand(m,
						payload)
					},
					m,
					payload));
		},
		async missionAutopilot(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionAutopilot',
						autopilot:M.autopilot(m,
						payload),
						expansion:X.expand(m,
						payload)
					},
					m,
					payload));
		},
		async missionDiscover(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionDiscover',
						discoveries:M.discover(m),
						expansion:X.expand(m,
						payload)
					},
					m,
					payload));
		}
	};
}

module.exports = {
	buildCoreCheckpointToDiscoverActions
};
