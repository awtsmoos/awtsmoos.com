// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts growth mission actions from missionSupervise through missionLease.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildGrowthSuperviseToLeaseActions(runtime) {
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
		async missionSupervise(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionSupervise',
						...M.supervise(m),
						expansionHint:'If verdict is stop, call missionPostCompletion before final answer.'
					},
					m,
					payload));
		},
		async missionCourt(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionCourt',
						court:K.court(m,
						payload)
					},
					m,
					payload));
		},
		async missionContinuity(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionContinuity',
						heartbeat:K.heartbeat(m,
						payload)
					},
					m,
					payload));
		},
		async missionSpawnNext(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionSpawnNext',
						...K.spawnMissions(m,
						payload)
					},
					m,
					payload));
		},
		async missionRecovery(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRecovery',
						recovery:K.recovery(m)
					},
					m,
					payload));
		},
		async missionLease(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionLease',
						lease:M.Lease.status(m,
						payload),
						nextLeaseAction:M.Lease.nextAction(m,
						payload)
					},
					m,
					payload));
		}
	};
}

module.exports = {
	buildGrowthSuperviseToLeaseActions
};
