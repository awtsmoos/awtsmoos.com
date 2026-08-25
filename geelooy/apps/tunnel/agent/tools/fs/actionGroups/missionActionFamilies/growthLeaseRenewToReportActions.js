// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts growth mission actions from missionLeaseRenew through missionReport.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildGrowthLeaseRenewToReportActions(runtime) {
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
		async missionLeaseRenew(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionLeaseRenew',
						lease:M.Lease.renew(m,
						payload)
					},
					m,
					payload));
		},
		async missionEntropy(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionEntropy',
						entropy:M.Constitution.entropy(m)
					},
					m,
					payload));
		},
		async missionConstitution(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionConstitution',
						constitution:M.Constitution.review(m),
						nextConstitutionAction:M.Constitution.nextAction(m,
						M.Constitution.review(m))
					},
					m,
					payload));
		},
		async missionVerify(){
			return use(config,
				payload,
				m=>{
					const verification=M.verify(m);
					const shouldExpand=payload.expand===true||payload.expand==='true'||payload.autoExpand===true||payload.autoExpand==='true';
					const after=verification.ok?(shouldExpand?X.postCompletion(m,
						{
							verification:'verified complete, entering improvement mode'
						}):null):(shouldExpand?X.expand(m,
						payload):null);
					return withNext({
							ok:true,
							action:'missionVerify',
							verification,
							after
						},
						m,
						payload);
				});
		},
		async missionReport(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionReport',
						report:M.report(m),
						reportIsFinal:false,
						finalizationAction:'missionFinalize'
					},
					m,
					payload));
		}
	};
}

module.exports = {
	buildGrowthLeaseRenewToReportActions
};
