// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts room recovery mission actions from missionRoomLoopStatus through missionRoomClaimFile.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildRoomRecoveryRoomLoopStatusToRoomClaimFileActions(runtime) {
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
		async missionRoomLoopStatus(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomLoopStatus',
						roomStatus:M.roomStatus(m),
						inbox:M.roomInbox(m,
						metaPayload(payload,
						config)),
						watchdog:M.roomWatchdog(m,
						metaPayload(payload,
						config)),
						fileConflicts:M.roomFileConflicts(m,
						metaPayload(payload,
						config))
					},
					m,
					payload));
		},
		async missionRoomWatchdog(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomWatchdog',
						watchdog:M.roomWatchdog(m,
						metaPayload(payload,
						config)),
						roomStatus:M.roomStatus(m)
					},
					m,
					payload));
		},
		async missionRoomRecoverStaleAgent(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomRecoverStaleAgent',
						recovery:M.roomRecoverStaleAgent(m,
						metaPayload(payload,
						config)),
						roomStatus:M.roomStatus(m)
					},
					m,
					payload));
		},
		async missionRoomClaimFile(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomClaimFile',
						claimFile:M.roomClaimFile(m,
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
	buildRoomRecoveryRoomLoopStatusToRoomClaimFileActions
};
