// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts growth mission actions from missionExpand through missionPostCompletion.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildGrowthExpandToPostCompletionActions(runtime) {
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
		async missionExpand(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionExpand',
						expansion:X.expand(m,
						payload)
					},
					m,
					payload));
		},
		async missionEvidenceDebt(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionEvidenceDebt',
						evidenceDebt:X.evidenceDebt(m)
					},
					m,
					payload));
		},
		async missionPlanDelta(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionPlanDelta',
						delta:X.planDelta(m,
						payload)
					},
					m,
					payload));
		},
		async missionFamilies(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionFamilies',
						families:X.families(m)
					},
					m,
					payload));
		},
		async missionImprovementPlan(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionImprovementPlan',
						improvementPlan:X.improvementPlan(m,
						payload)
					},
					m,
					payload));
		},
		async missionPostCompletion(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionPostCompletion',
						postCompletion:X.postCompletion(m,
						payload)
					},
					m,
					{
						...payload,
						auto:true
					}));
		}
	};
}

module.exports = {
	buildGrowthExpandToPostCompletionActions
};
