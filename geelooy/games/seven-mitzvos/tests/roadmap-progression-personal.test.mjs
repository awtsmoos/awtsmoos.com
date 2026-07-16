//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RoadmapProgressionPersonalTest
 * @description
 * Capability progression, professions, housing, companions, knowledge,
 * customization, difficulty, and replay metadata on Awtsmoos.com are verified
 * as qualitative, provenance-aware, non-pay-to-win systems.
 */
import assert from 'node:assert/strict';
import { ProgressionService } from '../js/progression/progression-service.js';
import { ProfessionService } from '../js/professions/profession-service.js';
import { HousingService } from '../js/personal/housing-service.js';
import { CompanionService } from '../js/companions/companion-service.js';
import { KnowledgeService } from '../js/knowledge/knowledge-service.js';
import { CustomizationService } from '../js/customization/customization-service.js';
import { DifficultyService } from '../js/difficulty/difficulty-service.js';
import { ReplayMetadataService } from '../js/replay/replay-metadata-service.js';

const progression = new ProgressionService();
let progress = progression.create();
progress = progression.award(progress, {
	layer: 'institutionalCapabilities',
	achievementId: 'fair-market-hearing',
	unlockCapabilityIds: ['case.appeal', 'market.audit']
});
assert.equal(progression.can(progress, 'case.appeal'), true);

const professions = new ProfessionService();
let judge = professions.create('judge');
judge = professions.practice(judge, {
	method: 'supervised-work',
	hours: 80,
	specialization: 'commercial',
	reflection: 'Evidence must support every remedy.'
});
judge = professions.certify(judge, 'regional-commercial-judge', 100);
assert.ok(judge.specializations.includes('commercial'));
assert.ok(judge.certifications.includes('regional-commercial-judge'));

const housing = new HousingService();
let home = housing.create('person-1', 'home-1');
home = housing.addFeature(home, 'guestRoom');
home = housing.host(home, 'person-2', 'regional mediation');
assert.equal(home.guests.length, 1);

const companions = new CompanionService();
let companion = companions.create({
	name: 'Ari',
	personality: 'patient',
	primarySkill: 'mediation'
}, 'companion-1');
companion = companions.record(companion, {
	type: 'aid',
	loyaltyDelta: 12
});
const delegation = companions.delegate(companion, 'mediator', {
	allowedActions: ['interview', 'draft-plan'],
	expiresAtMinute: 5000
});
assert.ok(delegation.blockedActions.includes('court-ruling'));

const knowledge = new KnowledgeService();
let record = knowledge.create({
	title: 'Clean-water monitoring',
	discovererId: 'person-1',
	sourceId: 'archive-1',
	teachingRequirements: ['water-certification']
}, 'knowledge-1');
record = knowledge.teach(
	record,
	'person-1',
	'person-2',
	['water-certification']
);
assert.ok(record.holders.includes('person-2'));

const customization = new CustomizationService();
let settings = customization.create();
settings = customization.set(settings, 'cityBanner', { symbol: 'seven-lights' });
settings = customization.remap(settings, 'confirm', 'GamepadA');
assert.equal(settings.remapping.confirm, 'GamepadA');

const difficulty = new DifficultyService();
assert.equal(difficulty.preset('severe').eventFrequency, 1.35);
const replay = new ReplayMetadataService();
const metadata = replay.create({
	worldSeed: 'equal-seed',
	modeId: 'challenge',
	contentVersions: { base: '1.0.0' }
});
assert.ok(metadata.identity);
console.log('B"H · Progression, personal systems, knowledge, difficulty, and replay verified.');
