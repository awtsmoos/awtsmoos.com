/** B"H @module MissionJournal - readable rows for the authored campaign. */
import { State } from '../binah/State.js';
import { activeMission, currentObjective, missionProgressLine } from './MissionRuntime.js';

export const campaignMissionSummary = () => {
	const active = activeMission();
	return {
		active: active ? { id: active.mission.id, title: active.mission.title, progress: missionProgressLine() } : null,
		objective: currentObjective(),
		completed: [...State.Missions.completed],
		minutes: State.Campaign.playMinutes,
		chapter: State.Campaign.chapterId,
		ending: State.Campaign.ending
	};
};

export const campaignMissionRows = () => {
	const summary = campaignMissionSummary();
	return [
		['Main Mission', summary.active?.title || 'Complete'],
		['Objective', summary.active?.progress || 'The road remains open.'],
		['Chapter', summary.chapter],
		['Authored minutes complete', summary.minutes],
		['Main missions complete', summary.completed.length]
	];
};
