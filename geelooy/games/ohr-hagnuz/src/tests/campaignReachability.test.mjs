/**
 * B"H
 * @file campaignReachability.test.mjs
 * @description Proves every ordered mission and scene reaches a chosen ending.
 */
import assert from 'node:assert/strict';

global.window = { AwtsmoosIntents: { U:0,D:0,L:0,R:0,A:0,B:0 } };
const { State } = await import('../binah/State.js');
const { tickCampaign } = await import('../campaign/CampaignDirector.js');
const { CampaignMissionList, campaignMinutes } = await import('../content/CampaignMissions.js');
const { activeMission, currentObjective, recordMissionEvent } = await import('../missions/MissionRuntime.js');
const { advanceScene, chooseSceneChoice, sceneActive, sceneChoices } = await import('../story/SceneRuntime.js');

const advanceOneSceneBeat = () => {
	const choices = sceneChoices();
	if (choices.length) return chooseSceneChoice(choices[0].id);
	return advanceScene();
};

for (let safety = 0; safety < 2000; safety += 1) {
	if (sceneActive()) {
		advanceOneSceneBeat();
		continue;
	}
	if (State.Missions.pendingSceneId || State.Missions.pendingNextMissionId) {
		tickCampaign();
		continue;
	}
	const active = activeMission();
	if (!active) {
		if (State.Campaign.flags.mainCampaignComplete) break;
		tickCampaign();
		continue;
	}
	const objective = currentObjective();
	if (objective?.sceneId) {
		tickCampaign();
		continue;
	}
	assert.ok(objective, `mission ${active.mission.id} must have a current objective`);
	recordMissionEvent(objective.type, objective.target, {
		amount: objective.count || 1,
		mapId: objective.mapId || active.mission.mapId
	});
}

assert.equal(State.Campaign.flags.mainCampaignComplete, true, 'main campaign must reach completion');
assert.equal(State.Missions.completed.length, CampaignMissionList.length, 'every main mission must complete');
assert.equal(State.Campaign.playMinutes, campaignMinutes(), 'all authored minutes must be accounted for');
assert.ok(State.Campaign.ending, 'the final choice must select an ending');
assert.equal(activeMission(), null, 'no main mission may remain active after the ending');
console.log(JSON.stringify({ completed: State.Missions.completed.length, minutes: State.Campaign.playMinutes, ending: State.Campaign.ending }));
