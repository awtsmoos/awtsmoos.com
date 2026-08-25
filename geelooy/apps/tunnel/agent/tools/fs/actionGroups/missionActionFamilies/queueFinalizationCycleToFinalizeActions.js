// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts queue finalization mission actions from missionCycle through missionFinalize.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildQueueFinalizationCycleToFinalizeActions(runtime) {
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
		async missionCycle(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionCycle',
						cycle:M.cycle(m,
						payload),
						cycleStatus:M.CycleArtifacts.status(m)
					},
					m,
					payload));
		},
		async missionQueueStatus(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionQueueStatus',
						queue:M.queueStatus(m),
						nextRequiredAction:M.nextRequiredAction(m)
					},
					m,
					payload));
		},
		async missionQueueAdd(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionQueueAdd',
						item:M.queueAdd(m,
						payload),
						queue:M.queueStatus(m)
					},
					m,
					payload));
		},
		async missionQueueComplete(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionQueueComplete',
						item:M.queueComplete(m,
						payload),
						queue:M.queueStatus(m),
						nextRequiredAction:M.nextRequiredAction(m)
					},
					m,
					payload));
		},
		async missionFinalize(){
			return use(config,
				payload,
				m=>{
					const finalization=M.finalize(m,
						payload);
					return withNext({
							ok:true,
							action:'missionFinalize',
							finalizationAttempt:finalization,
							finalAnswerAllowed:finalization.finalAnswerAllowed===true,
							mustContinue:finalization.mustContinue!==false,
							mustCallNext:finalization.mustCallNext||null
						},
						m,
						payload);
				});
		}
	};
}

module.exports = {
	buildQueueFinalizationCycleToFinalizeActions
};
