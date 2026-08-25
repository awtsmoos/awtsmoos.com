// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts core mission actions from missionAnswer through missionHeartbeat.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildCoreAnswerToHeartbeatActions(runtime) {
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
		async missionAnswer(){
			return use(config,
				payload,
				m=>{
					const answer=M.answer(m,
						payload);
					const shouldExpand=payload.expand===true||payload.expand==='true'||payload.autoExpand===true||payload.autoExpand==='true';
					const expansion=shouldExpand?X.expand(m,
						payload):null;
					return withNext({
							ok:true,
							action:'missionAnswer',
							...answer,
							expansion
						},
						m,
						payload);
				});
		},
		async missionAuto(){
			return use(config,
				payload,
				m=>{
					m.automation.enabled=payload.enabled!==false&&payload.enabled!=='false';
					m.automation.mode='tunnel-authored';
					if(payload.maxCycles)m.automation.maxCycles=Number(payload.maxCycles);
					const expansion=X.expand(m,
						payload);
					return withNext({
							ok:true,
							action:'missionAuto',
							automation:m.automation,
							expansion
						},
						m,
						{
							...payload,
							auto:true
						});
				});
		},
		async missionAttachJob(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionAttachJob',
						job:M.attachJob(m,
						payload)
					},
					m,
					payload));
		},
		async missionHeartbeat(){
			return use(config,
				payload,
				m=>({
						ok:true,
						action:'missionHeartbeat',
						heartbeat:M.heartbeat(m,
						payload),
						expansionHint:'Use missionExpand after meaningful work or uncertainty.'
					}));
		}
	};
}

module.exports = {
	buildCoreAnswerToHeartbeatActions
};
