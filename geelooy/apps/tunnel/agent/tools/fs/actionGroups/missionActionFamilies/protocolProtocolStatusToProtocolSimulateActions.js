// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts protocol mission actions from missionProtocolStatus through missionProtocolSimulate.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildProtocolProtocolStatusToProtocolSimulateActions(runtime) {
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
		async missionProtocolStatus(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionProtocolStatus',
						protocol:M.protocolStatus(m),
						nextRequiredAction:M.protocolNext(m)
					},
					m,
					payload));
		},
		async missionProtocolFinalizeCheck(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionProtocolFinalizeCheck',
						verdict:M.ProtocolFinalizationGuard.verdict(m,
						M)
					},
					m,
					payload));
		},
		async missionProtocolSimulate(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionProtocolSimulate',
						simulation:PS.simulate(M,
						config,
						m,
						payload),
						protocol:M.protocolStatus(m)
					},
					m,
					payload));
		}
	};
}

module.exports = {
	buildProtocolProtocolStatusToProtocolSimulateActions
};
