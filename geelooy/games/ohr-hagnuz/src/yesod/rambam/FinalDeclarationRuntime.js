/**
 * B"H
 * @module FinalDeclarationRuntime
 * @description Preserves the legacy Rambam ending while advancing the authored campaign into its final battle.
 *
 * The same hidden light may arrive through two verified roads. This module
 * keeps their endings distinct without splitting truth into rival state trees.
 */
import { State } from '../../binah/State.js';
import { CampaignMissionList } from '../../content/CampaignMissions.js';
import { recordMissionEvent } from '../../missions/MissionRuntime.js';
import { declarationTruthReport, generatedDeclarationText, refreshDeclaration } from './DeclarationRuntime.js';

const prerequisiteMissionIds = () => CampaignMissionList
	.filter(mission => !['final_declaration', 'final_epilogue'].includes(mission.id))
	.map(mission => mission.id);

const campaignTruthReport = () => {
	const completed = new Set(State.Missions?.completed || []);
	const missing = prerequisiteMissionIds().filter(id => !completed.has(id));
	return { ready: missing.length === 0, missing };
};

const campaignDeclarationText = () => [
	'I restored a letter without pretending the silence was empty.',
	'I gave first things to their rightful receivers.',
	'I traded ordinary goods without pricing blessing or song.',
	'I carried students, teachers, memory, and joy through forgetting.',
	'I crossed the fire with every entrusted relationship intact.',
	'I speak now from deeds witnessed across the whole road.'
];

const rememberLines = lines => {
	State.Inventory.journal ||= { notes: [] };
	State.Inventory.journal.notes ||= [];
	State.Inventory.journal.notes.unshift(...lines);
};

const setLegacyEnding = () => {
	State.Story.active = 'Ohr HaGnuz Revealed';
	State.Story.chapter = 6;
	State.Story.act = 6;
	State.Story.region = 'Ohr HaGanuz Realm';
	State.Story.objective = 'Walk the hidden orchard and master every Musag.';
	State.Story.nextStep = 'Complete the Dex, skills, and hidden orchard.';
};

const setCampaignBattle = () => {
	State.Story.active = 'Declaration Spoken';
	State.Story.chapter = 6;
	State.Story.act = 6;
	State.Story.region = 'Final Declaration';
	State.Story.objective = 'Face the Shattered Name.';
	State.Story.nextStep = 'Every verified clause now stands as a witness.';
	recordMissionEvent('DECLARE', 'declaration_clause', { amount: 6 });
};

export const finalDeclarationReady = () => {
	const legacy = declarationTruthReport();
	const campaign = campaignTruthReport();
	return legacy.ready || campaign.ready;
};

export const attemptFinalDeclaration = () => {
	const status = refreshDeclaration();
	const legacy = declarationTruthReport();
	const campaign = campaignTruthReport();
	const ready = legacy.ready || campaign.ready;
	const lines = campaign.ready ? campaignDeclarationText() : generatedDeclarationText();
	rememberLines(lines);
	if (!ready) {
		const missing = [
			...status.missingGifts,
			...status.locked.map(line => line.text),
			...legacy.houseMissing.map(id => `House room: ${id}`),
			...campaign.missing.map(id => `Mission: ${id}`)
		].join(' / ');
		State.Story.active = 'Declaration Not Yet True';
		State.Story.act = 6;
		State.Story.region = 'Final Declaration';
		State.Story.objective = `Restore what is missing: ${missing}.`;
		State.Story.nextStep = 'Return to the witnesses before speaking the final words.';
		State.say(`The declaration is not whole. Missing: ${missing}`, 900);
		return { ok: false, lines, report: legacy, legacy, campaign };
	}
	State.Gifts.declaration.ready = true;
	if (campaign.ready) setCampaignBattle(); else setLegacyEnding();
	State.say('B"H. I did not forget. Six true clauses stand as witnesses.', 1200);
	return { ok: true, lines, report: legacy, legacy, campaign };
};
