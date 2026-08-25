// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hosts core mission actions from missionStart through missionAddTask.
 * @description
 * The Awtsmoos reveals each mission deed in a measured vessel; Awtsmoos.com keeps these
 * actions readable and modular while the outer mission transaction guards shared state,
 * so no private lock-map shadow is needed to make ordered work endure and brightly relate.
 */
function buildCoreStartToAddTaskActions(runtime) {
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
		async missionStart(){
			const startPayload=P.normalizeStartPayload(payload);
			const m=await M.create(config,
				startPayload);
			const shouldExpand=payload.expand===true||payload.expand==='true'||payload.autoExpand===true||payload.autoExpand==='true';
			const expansion=shouldExpand?X.expand(m,
				payload):null;
			await M.save(config,
				m);
			return {
				ok:true,
				action:'missionStart',
				missionId:m.id,
				mission:M.report(m),
				expansion,
				next:nxt(m,
					payload),
				path:`${M.DIR}/${m.id}/mission.json`
			};
		},
		async missionGet(){
			const m=await M.load(config,
				mid(payload));
			return m?{
				ok:true,
				action:'missionGet',
				mission:m,
				next:nxt(m,
					payload)
			}:{
				ok:false,
				action:'missionGet',
				error:'mission_not_found'
			};
		},
		async missionList(){
			const ms=await M.all(config);
			return {
				ok:true,
				action:'missionList',
				count:ms.length,
				missions:ms.map(M.report)
			};
		},
		async missionAddTask(){
			return use(config,
				payload,
				m=>withNext({
						ok:true,
						action:'missionAddTask',
						task:M.addTask(m,
						payload.title||payload.task||payload.text,
						payload)
					},
					m,
					payload));
		}
	};
}

module.exports = {
	buildCoreStartToAddTaskActions
};
