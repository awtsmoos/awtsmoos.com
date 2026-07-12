/**
 * B"H
 * @module MissionRuntime
 * @description Starts, advances, completes, and chains the four-hour campaign.
 */
import { State } from '../binah/State.js';
import { campaignMissionById } from '../content/CampaignMissions.js';
import { applyObjectiveEvent, objectiveLine } from './ObjectiveRuntime.js';
import { grantMissionRewards } from './MissionRewards.js';

export const activeMission = () => {
	const id = Object.keys(State.Missions.active || {})[0];
	return id ? { mission: campaignMissionById(id), instance: State.Missions.active[id] } : null;
};

export const currentObjective = () => {
	const active = activeMission();
	if (!active) return null;
	return active.mission.objectives[active.instance.objectiveIndex] || null;
};

const setStoryFromMission = mission => {
	State.Story.active = mission.title;
	State.Story.region = mission.mapId;
	State.Story.chapter = ['prologue', 'village', 'garden', 'market', 'house', 'finale'].indexOf(mission.chapter);
	State.Story.objective = objectiveLine(currentObjective(), 0);
	State.Story.nextStep = State.Story.objective;
};

export const startMission = id => {
	const mission = campaignMissionById(id);
	if (!mission || State.Missions.completed.includes(id)) return false;
	State.Missions.active = { [id]: { objectiveIndex: 0, progress: 0, startedAt: Date.now() } };
	State.Missions.pendingSceneId = mission.introScene;
	State.Missions.pendingNextMissionId = null;
	State.Missions.autoActionKey = null;
	State.Campaign.started = true;
	State.Campaign.mainMissionId = id;
	State.Campaign.chapterId = mission.chapter;
	setStoryFromMission(mission);
	return true;
};

const completeMission = (mission, instance) => {
	delete State.Missions.active[mission.id];
	if (!State.Missions.completed.includes(mission.id)) State.Missions.completed.push(mission.id);
	State.Missions.history.unshift({ id: mission.id, completedAt: Date.now(), minutes: mission.minutes });
	State.Campaign.playMinutes += mission.minutes;
	State.Campaign.chapterHistory.push(mission.chapter);
	const granted = grantMissionRewards(mission);
	State.Missions.pendingSceneId = mission.completionScene;
	State.Missions.pendingNextMissionId = mission.next;
	State.Story.objective = mission.next ? 'Listen to the completion scene.' : 'The main campaign is complete.';
	State.Story.nextStep = State.Story.objective;
	if (mission.finale) {
		State.Story.active = 'Ohr HaGnuz Revealed';
		State.Campaign.flags.mainCampaignComplete = true;
	}
	State.say(`${mission.title} complete. ${granted.line}.`, 720);
	return granted;
};

export const recordMissionEvent = (type, target, payload = {}) => {
	const active = activeMission();
	if (!active) return { matched: false, reason: 'no-active-mission' };
	const objective = active.mission.objectives[active.instance.objectiveIndex];
	const result = applyObjectiveEvent(active.instance, objective, { type, target, ...payload });
	if (!result.matched) return result;
	State.Missions.history.unshift({ missionId: active.mission.id, objectiveId: objective.id, type, target, at: Date.now() });
	State.Missions.autoActionKey = null;
	if (result.completed) {
		active.instance.objectiveIndex += 1;
		active.instance.progress = 0;
	}
	const next = active.mission.objectives[active.instance.objectiveIndex];
	State.Story.objective = objectiveLine(next, active.instance.progress);
	State.Story.nextStep = State.Story.objective;
	if (!next) completeMission(active.mission, active.instance);
	else State.say(`Objective complete. Next: ${State.Story.nextStep}`, 360);
	return { ...result, next };
};

export const missionProgressLine = () => {
	const active = activeMission();
	if (!active) return State.Campaign.flags.mainCampaignComplete ? 'Main campaign complete.' : 'No active mission.';
	const objective = active.mission.objectives[active.instance.objectiveIndex];
	return `${active.mission.title}: ${objectiveLine(objective, active.instance.progress)}`;
};
