// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts step protocol mission actions from missionStepBrainstorm through missionStepReview.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildStepProtocolStepBrainstormToStepReviewActions(runtime) {
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
		async missionStepBrainstorm(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionStepBrainstorm',
						...S.brainstorm(m,
						payload)
					},
					m,
					payload));
		},
		async missionStepPlan(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionStepPlan',
						...S.stepPlan(m,
						payload)
					},
					m,
					payload));
		},
		async missionFilesToTouch(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionFilesToTouch',
						...S.filesToTouch(m,
						payload)
					},
					m,
					payload));
		},
		async missionChunkPlan(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionChunkPlan',
						...S.chunkPlan(m,
						payload)
					},
					m,
					payload));
		},
		async missionStepExecute(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionStepExecute',
						...S.execute(m,
						payload)
					},
					m,
					payload));
		},
		async missionStepReview(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionStepReview',
						...S.review(m,
						payload)
					},
					m,
					payload));
		}
	};
}

module.exports = {
	buildStepProtocolStepBrainstormToStepReviewActions
};
