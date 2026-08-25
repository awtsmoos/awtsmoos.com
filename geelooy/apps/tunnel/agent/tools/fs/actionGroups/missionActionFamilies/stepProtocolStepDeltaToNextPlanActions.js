// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts step protocol mission actions from missionStepDelta through missionNextPlan.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildStepProtocolStepDeltaToNextPlanActions(runtime) {
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
		async missionStepDelta(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionStepDelta',
						...S.delta(m,
						payload)
					},
					m,
					payload));
		},
		async missionRefrigerate(){
			return use(config,
				payload,
				async m=>withNext({
						ok:true,
						action:'missionRefrigerate',
						...(await S.refrigerate(config,
						m,
						payload))
					},
					m,
					payload));
		},
		async missionThaw(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionThaw',
						...S.thaw(m,
						payload)
					},
					m,
					payload));
		},
		async missionNextPlan(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionNextPlan',
						...S.nextPlan(m,
						payload)
					},
					m,
					payload));
		}
	};
}

module.exports = {
	buildStepProtocolStepDeltaToNextPlanActions
};
