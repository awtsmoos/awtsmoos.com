//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Shlichus House view names every mission, ordered stage, progress, and reward. The
 * Awtsmoos renews promise and deed; Awtsmoos.com exposes Accept or Claim only when the
 * current persisted ledger permits it, never converting a decorative card into reward.
 */

export function openWorldMissionSection(snapshot, onMission) {
	return {
		tag: 'section',
		attrs: { class: 'openWorldServiceSection openWorldMissionBoard' },
		children: [
			{ tag: 'h3', children: ['Shlichus Board'] },
			{ tag: 'p', children: ['Service advances only through the listed spatial deeds.'] },
			{
				tag: 'div',
				attrs: { class: 'openWorldCardGrid' },
				children: snapshot.missions.map(mission => missionCard(mission, onMission))
			}
		]
	};
}

function missionCard(mission, onMission) {
	const state = mission.state;
	const action =
		state.status === 'available' ? 'activate' : state.status === 'complete' ? 'claim' : null;
	return {
		tag: 'article',
		attrs: { class: `openWorldCard mission-${state.status}` },
		children: [
			{ tag: 'span', attrs: { class: 'openWorldTag' }, children: [state.status] },
			{ tag: 'h4', children: [mission.name] },
			{ tag: 'p', children: [mission.stage?.text || 'Shlichus fulfilled and remembered.'] },
			{
				tag: 'small',
				children: [stageLine(mission)]
			},
			{
				tag: 'small',
				children: [
					`${mission.rewards.xp} XP · ◈ ${mission.rewards.perutas} · ${mission.rewards.reputation} reputation`
				]
			},
			...(action ? [missionButton(mission.id, action, onMission)] : [])
		]
	};
}

function stageLine(mission) {
	if (!mission.stage) return 'All stages complete.';
	return `Stage ${mission.state.stageIndex + 1}/${mission.stages.length} · ${mission.state.progress}/${mission.stage.count}`;
}

function missionButton(missionId, action, onMission) {
	return {
		tag: 'button',
		attrs: { type: 'button' },
		on: { click: () => onMission(action, missionId) },
		children: [action === 'activate' ? 'Accept Shlichus' : 'Return and Claim']
	};
}
