/**
 * B"H
 * @module CampaignDirector
 * @description Boots missions and launches pending, objective, and battle actions.
 *
 * A story choice enters only when its question is alive. The Awtsmoos creates
 * each instant anew; the director therefore waits for the precise objective
 * vessel instead of spending a decision before the player reaches it.
 */
import { State } from '../binah/State.js';
import { encounterById } from '../data/EncounterIndex.js';
import { activeMission, currentObjective, startMission } from '../missions/MissionRuntime.js';
import { sceneActive, startScene } from '../story/SceneRuntime.js';
import { startDebate } from '../yesod/OhrDebate.js';

const campaignBlocked = () => sceneActive() || State.Dialogue.open || State.ActiveRealm === 'DEBATE';

export const bootstrapCampaign = () => {
	if (State.Campaign.started || activeMission() || State.Campaign.flags.mainCampaignComplete) return false;
	return startMission('prologue_broken_aleph');
};

const beginPendingScene = () => {
	if (!State.Missions.pendingSceneId || campaignBlocked()) return false;
	const id = State.Missions.pendingSceneId;
	State.Missions.pendingSceneId = null;
	return startScene(id, id.endsWith('_complete') ? 'completion' : 'intro');
};

const beginPendingMission = () => {
	if (!State.Missions.pendingNextMissionId || campaignBlocked()) return false;
	const id = State.Missions.pendingNextMissionId;
	State.Missions.pendingNextMissionId = null;
	return startMission(id);
};

const beginObjectiveScene = () => {
	const active = activeMission();
	const objective = currentObjective();
	if (!active || !objective?.sceneId || campaignBlocked()) return false;
	const key = `${active.mission.id}:${objective.id}:scene`;
	if (State.Missions.autoActionKey === key) return false;
	State.Missions.autoActionKey = key;
	return startScene(objective.sceneId, 'objective');
};

const beginAutomaticBattle = () => {
	const active = activeMission();
	const objective = currentObjective();
	if (!active || !objective?.auto || objective.type !== 'BATTLE') return false;
	if (State.ActiveRealm !== 'OVERWORLD' || State.isUiBlocking()) return false;
	const key = `${active.mission.id}:${objective.id}:${active.instance.progress}`;
	if (State.Missions.autoActionKey === key) return false;
	State.Missions.autoActionKey = key;
	startDebate(encounterById(objective.target));
	return true;
};

export const tickCampaign = () => {
	bootstrapCampaign();
	if (beginPendingScene()) return;
	if (sceneActive()) return;
	if (beginPendingMission()) return;
	if (beginObjectiveScene()) return;
	beginAutomaticBattle();
};
