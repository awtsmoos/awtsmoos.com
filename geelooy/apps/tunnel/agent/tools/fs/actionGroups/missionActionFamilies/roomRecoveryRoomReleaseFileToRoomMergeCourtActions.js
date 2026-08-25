// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts room recovery mission actions from missionRoomReleaseFile through missionRoomMergeCourt.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildRoomRecoveryRoomReleaseFileToRoomMergeCourtActions(runtime) {
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
		async missionRoomReleaseFile(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomReleaseFile',
						releaseFile:M.roomReleaseFile(m,
						metaPayload(payload,
						config)),
						roomStatus:M.roomStatus(m)
					},
					m,
					payload));
		},
		async missionRoomFileConflicts(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomFileConflicts',
						conflicts:M.roomFileConflicts(m,
						metaPayload(payload,
						config)),
						roomStatus:M.roomStatus(m)
					},
					m,
					payload));
		},
		async missionRoomMergeCourt(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionRoomMergeCourt',
						court:M.roomMergeCourt(m,
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
	buildRoomRecoveryRoomReleaseFileToRoomMergeCourtActions
};
