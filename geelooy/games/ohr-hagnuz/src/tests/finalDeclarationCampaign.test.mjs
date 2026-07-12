/** B"H - a legitimate authored campaign satisfies the final declaration. */
import assert from 'node:assert/strict';

global.window = { AwtsmoosIntents: { U:0, D:0, L:0, R:0, A:0, B:0 } };
const { State } = await import('../binah/State.js');
const { CampaignMissionList } = await import('../content/CampaignMissions.js');
const { currentObjective, recordMissionEvent, startMission } = await import('../missions/MissionRuntime.js');
const { attemptFinalDeclaration, finalDeclarationReady } = await import('../yesod/rambam/FinalDeclarationRuntime.js');

State.Missions.completed = CampaignMissionList
	.filter(mission => !['final_declaration', 'final_epilogue'].includes(mission.id))
	.map(mission => mission.id);
assert.equal(finalDeclarationReady(), true);
assert.equal(startMission('final_declaration'), true);
recordMissionEvent('TRAVEL', 'Final_Declaration', { mapId: 'Final_Declaration' });
assert.equal(currentObjective().type, 'DECLARE');
const result = attemptFinalDeclaration();
assert.equal(result.ok, true);
assert.equal(currentObjective().type, 'BATTLE');
assert.equal(State.Gifts.declaration.ready, true);
console.log(JSON.stringify({ clauses: result.lines.length, next: currentObjective().target }));
