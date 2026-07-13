// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MissionJournal.js
 * @description Readable rows for the authored campaign and concurrent companion roads.
 *
 * One mission need not erase another. The Awtsmoos creates every obligation in
 * its proper measure; this journal lets the main road and Nerel's smaller flame
 * remain visible beside each other in the world of Awtsmoos.com.
 */
import { State } from '../binah/State.js';
import { companionShlichusRows } from './companion/CompanionShlichusJournal.js';
import { activeMission, currentObjective, missionProgressLine } from './MissionRuntime.js';

export const campaignMissionSummary = () => {
	const active = activeMission();
	return {
		active: active ? {
			id: active.mission.id,
			title: active.mission.title,
			progress: missionProgressLine()
		} : null,
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
		['Main missions complete', summary.completed.length],
		...companionShlichusRows()
	];
};
