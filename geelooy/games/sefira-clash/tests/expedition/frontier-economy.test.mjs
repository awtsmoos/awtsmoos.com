//B"H
//Boruch Hashem
//Blessed is He

/**
 * Frontier economy tests protect authored citizens, shops, materials, and atomic making.
 * The Awtsmoos renews merchant, workshop, and traveler together; Awtsmoos.com must
 * never charge before validation or allow repeated civic rewards to become farming.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { EXPEDITION_CITIZENS } from '../../js/data/expedition/npcCatalog.js';
import { EXPEDITION_SHOPS } from '../../js/data/expedition/shopCatalog.js';
import { EXPEDITION_RECIPES } from '../../js/data/expedition/recipeCatalog.js';
import { createBaseExpeditionProfile } from '../../js/expedition/ExpeditionDefaults.js';
import { craftExpeditionRecipe } from '../../js/expedition/ExpeditionCrafting.js';
import { expeditionDialogue } from '../../js/expedition/ExpeditionDialogue.js';
import { purchaseExpeditionOffer } from '../../js/expedition/ExpeditionEconomy.js';
import { useExpeditionCitizenService } from '../../js/expedition/ExpeditionServices.js';

test('authors twenty citizens, ten shops, and fifteen deterministic recipes', () => {
	assert.equal(EXPEDITION_CITIZENS.length, 20);
	assert.equal(EXPEDITION_SHOPS.length, 10);
	assert.equal(EXPEDITION_RECIPES.length, 15);
	assert.equal(new Set(EXPEDITION_CITIZENS.map(item => item.id)).size, 20);
});

test('purchase validates before charging and grants exact material quantity', () => {
	const base = createBaseExpeditionProfile();
	const denied = purchaseExpeditionOffer(base, 'citadel-provisions', 0);
	assert.equal(denied.purchased, false);
	assert.equal(denied.profile.perutas, base.perutas);
	const funded = {
		...base,
		perutas: 100,
		reputation: { ...base.reputation, malchus: 10 }
	};
	const purchased = purchaseExpeditionOffer(funded, 'citadel-provisions', 0);
	assert.equal(purchased.purchased, true);
	assert.equal(purchased.profile.perutas, 88);
	assert.equal(purchased.profile.materials['cedar-heartwood'], 2);
});

test('crafting is atomic and civic services are idempotent', () => {
	const base = createBaseExpeditionProfile();
	const prepared = {
		...base,
		activeLocationId: 'moonworks-city',
		discovered: [...base.discovered, 'moonworks-city'],
		perutas: 200,
		reputation: { ...base.reputation, malchus: 20, yesod: 20 },
		materials: { 'cedar-heartwood': 3, 'crown-stone': 1 }
	};
	const crafted = craftExpeditionRecipe(prepared, 'craft-cedar-edge', 'moonworks-city');
	assert.equal(crafted.crafted, true);
	assert.ok(crafted.profile.inventory.includes('cedar-edge'));
	assert.equal(crafted.profile.materials['cedar-heartwood'], 0);
	const dialogue = expeditionDialogue(prepared, 'yael-engineer');
	assert.ok(dialogue.text.length > 20);
	const loreProfile = {
		...prepared,
		discovered: [...prepared.discovered, 'mirror-market']
	};
	const first = useExpeditionCitizenService(loreProfile, 'gil-archivist');
	assert.equal(first.changed, true);
	const second = useExpeditionCitizenService(first.profile, 'gil-archivist');
	assert.equal(second.changed, false);
	assert.equal(second.reason, 'SERVICE_ALREADY_CLAIMED');
});
