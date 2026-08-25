// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts project collaboration mission actions from missionCollaborationUserMessage through missionAgentDelegate.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildProjectCollaborationCollaborationUserMessageToAgentDelegateActions(runtime) {
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
		async missionCollaborationUserMessage(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionCollaborationUserMessage',
						...C.userMessage(m,
						payload)
					},
					m,
					payload));
		},
		async missionRoomSettings(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomSettings',
						...C.settings(m,
						payload)
					},
					m,
					payload));
		},
		async missionAgentSync(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionAgentSync',
						...C.sync(m,
						payload)
					},
					m,
					payload));
		},
		async missionAgentMessage(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionAgentMessage',
						...C.message(m,
						payload)
					},
					m,
					payload));
		},
		async missionAgentRespond(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionAgentRespond',
						...C.respond(m,
						payload)
					},
					m,
					payload));
		},
		async missionAgentDelegate(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionAgentDelegate',
						...C.delegate(m,
						payload)
					},
					m,
					payload));
		}
	};
}

module.exports = {
	buildProjectCollaborationCollaborationUserMessageToAgentDelegateActions
};
