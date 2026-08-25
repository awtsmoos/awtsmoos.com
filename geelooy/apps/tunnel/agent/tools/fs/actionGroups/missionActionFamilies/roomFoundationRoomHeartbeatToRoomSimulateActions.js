// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts room foundation mission actions from missionRoomHeartbeat through missionRoomSimulate.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildRoomFoundationRoomHeartbeatToRoomSimulateActions(runtime) {
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
		async missionRoomHeartbeat(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomHeartbeat',
						heartbeat:M.roomHeartbeat(m,
						metaPayload(payload,
						config)),
						roomStatus:M.roomStatus(m)
					},
					m,
					payload));
		},
		async missionRoomMergeReports(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomMergeReports',
						mergeReport:M.roomMergeReports(m,
						metaPayload(payload,
						config)),
						roomStatus:M.roomStatus(m)
					},
					m,
					payload));
		},
		async missionRoomSimulate(){
			return use(config,
				payload,
				async m=>withNext({
						ok:true,
						action:'missionRoomSimulate',
						simulation:await M.roomSimulate(config,
						m,
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
	buildRoomFoundationRoomHeartbeatToRoomSimulateActions
};
