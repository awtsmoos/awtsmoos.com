// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts room recovery mission actions from missionRoomFindActive through missionRoomBrainstorm.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildRoomRecoveryRoomFindActiveToRoomBrainstormActions(runtime) {
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
		async missionRoomFindActive(){
			return {
				ok:true,
				action:'missionRoomFindActive',
				discovery:await M.roomFindActive(config,
					metaPayload(payload,
						config)),
				finalAnswerAllowed:true,
				mustContinue:false
			};
		},
		async missionMetadataStatus(){
			return {
				ok:true,
				action:'missionMetadataStatus',
				metadata:M.metadataStatus(config,
					metaPayload(payload,
						config)),
				finalAnswerAllowed:true,
				mustContinue:false
			};
		},
		async missionRoomUserMessage(){
			return use(config,
				payload,
				m=>{
					const roomMsg=M.roomUserMessage(m,
						metaPayload(payload,
						config));
					const collab=C.userMessage(m,
						payload);
					return withNext({
							...collab,
							ok:true,
							action:'missionRoomUserMessage',
							...roomMsg,
							roomMessage:roomMsg.message,
							userMessage:collab.userMessage,
							collaboration:collab.collaboration,
							finalAnswerAllowed:false,
							mustContinue:true,
							mustCallNext:collab.mustCallNext||M.roomStatus(m).mustCallNext,
							responseFocus:collab.responseFocus,
							roomStatus:M.roomStatus(m)
						},
						m,
						payload);
				});
		},
		async missionRoomBrainstorm(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomBrainstorm',
						brainstorm:M.roomBrainstorm(m,
						metaPayload(payload,
						config)),
						roomStatus:M.roomStatus(m)
					},
					m,
					payload));
		}
	};
}

module.exports = {
	buildRoomRecoveryRoomFindActiveToRoomBrainstormActions
};
