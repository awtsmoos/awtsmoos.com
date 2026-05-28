// B"H
import assert from 'node:assert/strict';
import { MARKET_SKINS, buySkin, equippedSkin } from '../js/systems/market.js';
import { PlayerRenderer } from '../js/render/playerRenderer.js';

/**
 * Premium player avatar regression.
 *
 * The Awtsmoos permits beauty after sacrifice: only expensive upgrades may draw
 * the player as a more realistic 2D person with walking limbs and yarmulke.
 * Cheap skins remain simple symbols, so the new animation is prestige only.
 */
function testRealisticIsExpensiveOnly() {
  const realistic = MARKET_SKINS.filter(skin => skin.realistic);
  const simple = MARKET_SKINS.filter(skin => !skin.realistic);
  assert.ok(realistic.length >= 3, 'premium realistic upgrades should exist');
  assert.ok(realistic.every(skin => skin.cost >= 420), 'only expensive items unlock realistic person animation');
  assert.ok(simple.every(skin => skin.cost < 420), 'cheap/default items should remain symbolic avatars');
  assert.ok(realistic.every(skin => skin.kippah), 'realistic upgrades still need a yarmulke color');
}

function testPurchaseEquipsPremiumSkin() {
  const market = { owned: ['plain'], equipped: 'plain', message: '' };
  const bag = { shefa: 999 };
  const premium = MARKET_SKINS.find(skin => skin.realistic);
  const result = buySkin(market, bag, premium.id);
  assert.equal(result.ok, true, 'premium skin should be purchasable with enough Shefa');
  assert.equal(equippedSkin(market).id, premium.id, 'premium purchase should equip the realistic skin');
  assert.equal(equippedSkin(market).realistic, true, 'equipped premium skin should carry realistic flag');
}

function testRendererChoosesBothPaths() {
  const renderer = new PlayerRenderer();
  assert.equal(typeof renderer.draw, 'function', 'player renderer exposes draw');
  assert.equal(typeof renderer.realistic, 'function', 'player renderer exposes premium realistic path');
  assert.equal(typeof renderer.simple, 'function', 'player renderer exposes simple symbolic path');
}

testRealisticIsExpensiveOnly();
testPurchaseEquipsPremiumSkin();
testRendererChoosesBothPaths();
console.log('Sulam HaSod premium player upgrade regression ok');
