// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file healingAmuletRules.test.cjs
 * @description Proves expert provenance, client/server parity, atomic purchase, healing, and rejection safety.
 * The Awtsmoos joins history, possession, wound, and consequence without client invention;
 * Awtsmoos.com verifies every fictional kamea across browser catalog and server authority.
 */

const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const test = require('node:test');
const {
	AMULET_EXPERT_ID,
	HEALING_AMULETS
} = require('./HealingAmuletCatalog.js');
const { HealingAmuletService } = require('./HealingAmuletService.js');
const { InventoryService } = require('./InventoryService.js');
const { EconomyService } = require('./EconomyService.js');
const { createPlayerState } = require('./PlayerState.js');
const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');

const CLIENT_CATALOG = path.resolve(
	'geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/HealingAmuletCatalog.js'
);

test('client and server amulet catalogs preserve exact gameplay law', async () => {
	const client = await import(pathToFileURL(CLIENT_CATALOG).href);
	for (const itemId of Object.keys(HEALING_AMULETS)) {
		const browserItem = client.HEALING_AMULET_CATALOG[itemId];
		const serverItem = HEALING_AMULETS[itemId];
		assert.equal(browserItem.effect.healing, serverItem.healing, itemId);
		assert.equal(browserItem.effect.certifiedUses, serverItem.certifiedUses, itemId);
		assert.equal(browserItem.price, serverItem.vendorBuyPrice, itemId);
		assert.equal(browserItem.stackLimit, serverItem.stackLimit, itemId);
		assert.match(serverItem.description, /not medical advice/i);
	}
});

test('expert-only purchase is atomic and preserves wallet truth', () => {
	const inventory = new InventoryService();
	const economy = new EconomyService(inventory);
	const player = createPlayerState();
	assert.throws(
		() => economy.buy(player, 'written-healing-kamea', 1),
		error => error.code === 'VENDOR_STOCK_MISMATCH'
	);
	assert.equal(player.wallet.mitzvahCoins, 100);
	const receipt = economy.buy(
		player,
		'written-healing-kamea',
		1,
		AMULET_EXPERT_ID
	);
	assert.equal(receipt.cost, 24);
	assert.equal(receipt.vendorId, AMULET_EXPERT_ID);
	assert.equal(player.wallet.mitzvahCoins, 76);
	assert.equal(inventory.quantity(player, 'written-healing-kamea'), 1);
});

test('authoritative use heals and consumes exactly one', () => {
	const inventory = new InventoryService();
	const service = new HealingAmuletService(inventory);
	const player = createPlayerState();
	inventory.add(player, 'root-herb-kamea', 2);
	player.combat.health = 75;
	const receipt = service.use(player, 'root-herb-kamea');
	assert.equal(receipt.before, 75);
	assert.equal(receipt.after, 100);
	assert.equal(receipt.healing, 25);
	assert.equal(receipt.remaining, 1);
	assert.equal(player.combat.health, 100);
});

test('full health and defeat reject without consuming', () => {
	for (const state of [
		{ health: 100, status: 'active', code: 'HEALTH_ALREADY_FULL' },
		{ health: 0, status: 'defeated', code: 'PLAYER_DEFEATED' }
	]) {
		const inventory = new InventoryService();
		const service = new HealingAmuletService(inventory);
		const player = createPlayerState();
		inventory.add(player, 'kamea-mumcheh', 1);
		Object.assign(player.combat, state);
		assert.throws(
			() => service.use(player, 'kamea-mumcheh'),
			error => error.code === state.code
		);
		assert.equal(inventory.quantity(player, 'kamea-mumcheh'), 1);
	}
});

test('protocol exposes private amulet command and receipt', () => {
	assert.equal(MESSAGE_TYPES.AMULET_USE, 'amulet.use');
	assert.equal(RESPONSE_TYPES.AMULET_USED, 'amulet.used');
});
