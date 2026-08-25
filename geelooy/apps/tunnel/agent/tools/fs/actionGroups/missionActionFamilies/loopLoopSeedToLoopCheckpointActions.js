// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts loop mission actions from missionLoopSeed through missionLoopCheckpoint.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildLoopLoopSeedToLoopCheckpointActions(runtime) {
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
		async missionLoopSeed(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionLoopSeed',
						...L.seed(m,
						payload)
					},
					m,
					payload));
		},
		async missionLoopPulse(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionLoopPulse',
						...L.pulse(m,
						payload)
					},
					m,
					payload));
		},
		async missionLoopQueue(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionLoopQueue',
						...L.queue(m,
						payload)
					},
					m,
					payload));
		},
		async missionLoopWatchdog(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionLoopWatchdog',
						watchdog:L.watchdog(m,
						payload),
						...L.pulse(m,
						{
							...payload,
							replenishFamilies:4
						})
					},
					m,
					payload));
		},
		async missionLoopCheckpoint(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionLoopCheckpoint',
						...L.checkpointLoop(m,
						payload)
					},
					m,
					payload));
		}
	};
}

module.exports = {
	buildLoopLoopSeedToLoopCheckpointActions
};
