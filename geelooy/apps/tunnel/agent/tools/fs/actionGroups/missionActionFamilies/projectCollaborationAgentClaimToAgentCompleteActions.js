// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts project collaboration mission actions from missionAgentClaim through missionAgentComplete.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildProjectCollaborationAgentClaimToAgentCompleteActions(runtime) {
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
		async missionAgentClaim(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionAgentClaim',
						...C.claim(m,
						payload)
					},
					m,
					payload));
		},
		async missionAgentHeartbeat(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionAgentHeartbeat',
						...C.heartbeat(m,
						payload)
					},
					m,
					payload));
		},
		async missionAgentAudit(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionAgentAudit',
						...C.audit(m,
						payload)
					},
					m,
					payload));
		},
		async missionAgentComplete(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionAgentComplete',
						...C.complete(m,
						payload)
					},
					m,
					payload));
		}
	};
}

module.exports = {
	buildProjectCollaborationAgentClaimToAgentCompleteActions
};
