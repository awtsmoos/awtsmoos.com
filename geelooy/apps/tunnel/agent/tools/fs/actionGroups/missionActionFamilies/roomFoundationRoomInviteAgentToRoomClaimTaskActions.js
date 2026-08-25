// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts room foundation mission actions from missionRoomInviteAgent through missionRoomClaimTask.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildRoomFoundationRoomInviteAgentToRoomClaimTaskActions(runtime) {
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
		async missionRoomInviteAgent(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomInviteAgent',
						invite:M.roomInviteAgent(m,
						metaPayload(payload,
						config)),
						roomStatus:M.roomStatus(m)
					},
					m,
					payload));
		},
		async missionRoomProposeSplit(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomProposeSplit',
						proposal:M.roomProposeSplit(m,
						metaPayload(payload,
						config)),
						roomStatus:M.roomStatus(m)
					},
					m,
					payload));
		},
		async missionRoomAcceptSplit(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomAcceptSplit',
						acceptance:M.roomAcceptSplit(m,
						metaPayload(payload,
						config)),
						agreement:M.roomAgreementStatus(m),
						roomStatus:M.roomStatus(m)
					},
					m,
					payload));
		},
		async missionRoomCreateSubMissions(){
			return use(config,
				payload,
				async m=>withNext({
						ok:true,
						action:'missionRoomCreateSubMissions',
						...(await M.roomCreateSubMissions(config,
						m,
						metaPayload(payload,
						config))),
						roomStatus:M.roomStatus(m)
					},
					m,
					payload));
		},
		async missionRoomClaimTask(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomClaimTask',
						claim:M.roomClaimTask(m,
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
	buildRoomFoundationRoomInviteAgentToRoomClaimTaskActions
};
