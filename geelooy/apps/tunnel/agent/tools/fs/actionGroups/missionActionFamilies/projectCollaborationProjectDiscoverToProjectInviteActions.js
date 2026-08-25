// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts project collaboration mission actions from missionProjectDiscover through missionProjectInvite.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildProjectCollaborationProjectDiscoverToProjectInviteActions(runtime) {
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
		async missionProjectDiscover(){
			const all=await M.all(config);
			const missions=all.filter(m=>matchesProject(m,
					payload)).slice(0,
				Number(payload.limit||20)).map(m=>({
						mission:M.report(m),
						collaboration:C.status(m),
						score:m.collaboration?2:1,
						updatedAt:m.updatedAt
					}));
			const next=missions[0]?{
				action:'missionProjectJoin',
				missionId:missions[0].mission.id,
				projectRoot:payload.projectRoot||payload.root||payload.directory||'',
				agentId:payload.agentId||payload.logicalAgentId||'agent'
			}:{
				action:'missionStart',
				goal:payload.goal||payload.q||'New mission room',
				projectRoot:payload.projectRoot||payload.root||payload.directory||''
			};
			return {
				ok:true,
				action:'missionProjectDiscover',
				count:missions.length,
				missions,
				next,
				nextSuggestedToolCall:next,
				finalAnswerAllowed:true,
				mustContinue:false
			};
		},
		async missionProjectJoin(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionProjectJoin',
						...C.join(m,
						payload)
					},
					m,
					payload));
		},
		async missionProjectStatus(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionProjectStatus',
						collaboration:C.status(m)
					},
					m,
					payload));
		},
		async missionProjectInvite(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionProjectInvite',
						invitePrompt:C.inviteText(m,
						payload),
						collaboration:C.status(m)
					},
					m,
					payload));
		}
	};
}

module.exports = {
	buildProjectCollaborationProjectDiscoverToProjectInviteActions
};
