/** B"H - campaign content, delayed choices, and opening runtime contract. */
import assert from 'node:assert/strict';

global.window = { AwtsmoosIntents: { U:0,D:0,L:0,R:0,A:0,B:0 } };
const { State } = await import('../binah/State.js');
const { CampaignMissionList, campaignMinutes } = await import('../content/CampaignMissions.js');
const { CampaignSceneList } = await import('../content/CampaignScenes.js');
const { currentObjective, recordMissionEvent, startMission } = await import('../missions/MissionRuntime.js');
const { advanceScene, chooseSceneChoice, startScene } = await import('../story/SceneRuntime.js');

assert.equal(CampaignMissionList.length, 20, 'campaign must contain twenty handcrafted main missions');
assert.equal(CampaignSceneList.length, 45, 'missions and delayed objective choices need forty-five scenes');
assert.ok(campaignMinutes() >= 240, 'authored campaign must target at least four hours');
assert.equal(startMission('prologue_broken_aleph'), true);
assert.equal(currentObjective().type, 'STARTER');
assert.equal(startScene('prologue_broken_aleph_intro'), true);
advanceScene();
advanceScene();
assert.equal(chooseSceneChoice('emes'), true);
assert.equal(State.Party.starterId, 'emes');
assert.equal(currentObjective().type, 'TALK');
recordMissionEvent('TALK', 'ג');
assert.equal(currentObjective().target, 'spark');
console.log(JSON.stringify({ missions: CampaignMissionList.length, scenes: CampaignSceneList.length, minutes: campaignMinutes(), starter: State.Party.starterId }));
