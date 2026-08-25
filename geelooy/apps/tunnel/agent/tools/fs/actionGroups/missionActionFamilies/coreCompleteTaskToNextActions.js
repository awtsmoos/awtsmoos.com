// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts core mission actions from missionCompleteTask through missionNext.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildCoreCompleteTaskToNextActions(runtime) {
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
		async missionCompleteTask(){
			return use(config,
				payload,
				m=>{
					const task=M.completeTask(m,
						payload.taskId||payload.task||payload.title,
						payload.evidenceId);
					const shouldExpand=payload.expand===true||payload.expand==='true'||payload.autoExpand===true||payload.autoExpand==='true';
					const expansion=shouldExpand?X.expand(m,
						{
							planned:payload.planned,
							actual:payload.actual||task?.title
						}):null;
					return withNext({
							ok:true,
							action:'missionCompleteTask',
							task,
							expansion
						},
						m,
						payload);
				});
		},
		async missionEvidence(){
			return use(config,
				payload,
				m=>{
					const evidence=M.evidence(m,
						P.normalizeEvidencePayload(payload));
					const includeDebt=payload.includeEvidenceDebt===true||payload.includeEvidenceDebt==='true'||payload.expand===true||payload.expand==='true';
					const debt=includeDebt?X.evidenceDebt(m):[];
					return withNext({
							ok:true,
							action:'missionEvidence',
							evidence,
							evidenceDebt:debt
						},
						m,
						payload);
				});
		},
		async missionQuestion(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionQuestion',
						...M.ask(m,
						payload.answer)
					},
					m,
					payload));
		},
		async missionNext(){
			return use(config,
				payload,
				m=>({
						ok:true,
						action:'missionNext',
						next:nxt(m,
						{
							...payload,
							auto:payload.auto??true
						}),
						nextRequiredAction:M.nextRequiredAction(m),
						queue:M.queueStatus(m),
						expansionPrompt:'If next still shows work, call missionAnswer, missionCycle, missionQueueComplete, or missionExpand; do not ask user.'
					}));
		}
	};
}

module.exports = {
	buildCoreCompleteTaskToNextActions
};
