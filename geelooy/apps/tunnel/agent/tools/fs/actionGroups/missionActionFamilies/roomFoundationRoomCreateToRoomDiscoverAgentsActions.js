// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts room foundation mission actions from missionRoomCreate through missionRoomDiscoverAgents.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildRoomFoundationRoomCreateToRoomDiscoverAgentsActions(runtime) {
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
		async missionRoomCreate(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomCreate',
						room:M.roomCreate(m,
						metaPayload(payload,
						config)),
						roomStatus:M.roomStatus(m)
					},
					m,
					payload));
		},
		async missionRoomJoin(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomJoin',
						agent:M.roomJoin(m,
						metaPayload(payload,
						config)),
						roomStatus:M.roomStatus(m)
					},
					m,
					payload));
		},
		async missionRoomStatus(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomStatus',
						roomStatus:M.roomStatus(m),
						agreement:M.roomAgreementStatus(m)
					},
					m,
					payload));
		},
		async missionRoomMessage(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomMessage',
						message:M.roomMessage(m,
						metaPayload(payload,
						config)),
						roomStatus:M.roomStatus(m)
					},
					m,
					payload));
		},
		async missionRoomDiscoverAgents(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomDiscoverAgents',
						discovery:M.roomDiscoverAgents(m,
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
	buildRoomFoundationRoomCreateToRoomDiscoverAgentsActions
};
