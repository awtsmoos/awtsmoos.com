// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts protocol mission actions from missionProtocolStart through missionProtocolReview.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildProtocolProtocolStartToProtocolReviewActions(runtime) {
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
		async missionProtocolStart(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionProtocolStart',
						protocol:M.protocolStart(m,
						payload),
						nextRequiredAction:M.protocolNext(m)
					},
					m,
					payload));
		},
		async missionProtocolNext(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionProtocolNext',
						protocol:M.protocolStatus(m),
						nextRequiredAction:M.protocolNext(m)
					},
					m,
					payload));
		},
		async missionProtocolStage(){
			return use(config,
				payload,
				m=>{
					const stageResult=M.protocolStage(config,
						m,
						payload);
					return withNext({
							ok:true,
							action:'missionProtocolStage',
							stageResult,
							error:stageResult.error||'',
							...(stageResult.ok?stageResult:{
							})
						},
						m,
						payload);
				});
		},
		async missionProtocolAnswer(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionProtocolAnswer',
						protocolAnswer:M.protocolAnswer(m,
						payload),
						protocol:M.protocolStatus(m)
					},
					m,
					payload));
		},
		async missionProtocolReview(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionProtocolReview',
						review:M.ProtocolReview.review(payload),
						protocol:M.protocolStatus(m)
					},
					m,
					payload));
		}
	};
}

module.exports = {
	buildProtocolProtocolStartToProtocolReviewActions
};
