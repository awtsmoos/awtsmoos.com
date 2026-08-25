// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts queue finalization mission actions from missionEarlyFinalAttempt through missionGraph.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildQueueFinalizationEarlyFinalAttemptToGraphActions(runtime) {
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
		async missionEarlyFinalAttempt(){
			return use(config,
				payload,
				m=>{
					const finalization=M.finalize(m,
						{
							...payload,
							reason:payload.reason||'explicit_early_final_attempt'
						});
					return withNext({
							ok:true,
							action:'missionEarlyFinalAttempt',
							earlyFinal:finalization,
							finalAnswerAllowed:false,
							mustContinue:true,
							mustCallNext:finalization.mustCallNext||M.nextRequiredAction(m)
						},
						m,
						payload);
				});
		},
		async missionTimeline(){
			return use(config,
				payload,
				m=>({
						ok:true,
						action:'missionTimeline',
						timeline:M.timeline(m)
					}));
		},
		async missionGraph(){
			return use(config,
				payload,
				m=>({
						ok:true,
						action:'missionGraph',
						graph:M.graph(m)
					}));
		}
	};
}

module.exports = {
	buildQueueFinalizationEarlyFinalAttemptToGraphActions
};
