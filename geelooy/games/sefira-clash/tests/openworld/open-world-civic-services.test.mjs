//B"H
//Boruch Hashem
//Blessed is He

/**
 * Civic service tests protect archive clues, clinic recovery, passage validation, kitchen
 * cost, council visits, and guesthouse news. The Awtsmoos renews room and traveler;
 * Awtsmoos.com validates current resources before one profile field or mission event changes.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { useOpenWorldCivicService } from '../../js/openworld/OpenWorldCivicService.js';
import {
	createFundedOpenWorldModel,
	installOpenWorldBrowserStubs
} from './open-world-test-fixture.mjs';

installOpenWorldBrowserStubs();

test('archive, clinic, council, and guesthouse emit bounded civic evidence', () => {
	const model = createFundedOpenWorldModel();
	const state = model.createOpenWorld();
	const archive = useOpenWorldCivicService(model.expedition.profile, state, 'archive');
	assert.equal(archive.used, true);
	assert.equal(archive.event.type, 'investigate');
	state.openWorld.combat.posture = 12;
	const human = state.fighters.find(fighter => fighter.human);
	human.damage = 80;
	const clinic = useOpenWorldCivicService(archive.profile, state, 'clinic');
	assert.equal(clinic.used, true);
	assert.equal(state.openWorld.combat.posture, 100);
	assert.equal(human.damage, 40);
	const council = useOpenWorldCivicService(clinic.profile, state, 'council');
	const guesthouse = useOpenWorldCivicService(council.profile, state, 'guesthouse');
	assert.equal(guesthouse.profile.openWorld.civicVisits.council, 1);
	assert.equal(guesthouse.profile.openWorld.civicVisits.guesthouse, 1);
});

test('ferry and kitchen validate passage and currency before mutation', () => {
	const model = createFundedOpenWorldModel();
	const state = model.createOpenWorld();
	const denied = useOpenWorldCivicService(model.expedition.profile, state, 'ferry');
	assert.equal(denied.used, false);
	const profile = {
		...model.expedition.profile,
		openWorld: {
			...model.expedition.profile.openWorld,
			provisions: { ...model.expedition.profile.openWorld.provisions, passage: 1 }
		}
	};
	const ferry = useOpenWorldCivicService(profile, state, 'ferry');
	assert.equal(ferry.profile.openWorld.provisions.passage, 0);
	const kitchen = useOpenWorldCivicService(ferry.profile, state, 'kitchen');
	assert.equal(kitchen.used, true);
	assert.equal(kitchen.profile.perutas, ferry.profile.perutas - 4);
	assert.equal(kitchen.profile.openWorld.provisions.meal, 1);
});
