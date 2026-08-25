// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts room recovery mission actions from missionRoomRecoverInterrupt through missionRoomLoopPulse.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildRoomRecoveryRoomRecoverInterruptToRoomLoopPulseActions(runtime) {
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
		async missionRoomRecoverInterrupt(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomRecoverInterrupt',
						recovery:M.roomRecoverInterrupt(m,
						metaPayload(payload,
						config)),
						roomStatus:M.roomStatus(m)
					},
					m,
					payload));
		},
		async missionRoomRealChatSimulate(){
			return use(config,
				payload,
				async m=>withNext({
						ok:true,
						action:'missionRoomRealChatSimulate',
						simulation:await M.roomRealChatSimulate(config,
						m,
						metaPayload(payload,
						config)),
						roomStatus:M.roomStatus(m)
					},
					m,
					payload));
		},
		async missionRoomWakeAgent(){
			return use(config,
				payload,
				async m=>withNext({
						ok:true,
						action:'missionRoomWakeAgent',
						wake:await M.roomWakeAgent(config,
						m,
						metaPayload(payload,
						config)),
						roomStatus:M.roomStatus(m)
					},
					m,
					payload));
		},
		async missionRoomInbox(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomInbox',
						inbox:M.roomInbox(m,
						metaPayload(payload,
						config)),
						roomStatus:M.roomStatus(m)
					},
					m,
					payload));
		},
		async missionRoomLoopPulse(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomLoopPulse',
						pulse:M.roomLoopPulse(m,
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
	buildRoomRecoveryRoomRecoverInterruptToRoomLoopPulseActions
};
