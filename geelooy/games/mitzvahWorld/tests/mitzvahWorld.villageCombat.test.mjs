#!/usr/bin/env node
/**
 * B"H
 * Verifies the village has a real combat training loop.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const manifest = fs.readFileSync('ckidsAwtsmoos/Olam/worlds/mitzvahWorld/combat/VillageCombatManifest.js', 'utf8');
const layer = fs.readFileSync('ckidsAwtsmoos/Olam/worlds/mitzvahWorld/postbuild/GeneratedBattleLayer.js', 'utf8');
const input = fs.readFileSync('ckidsAwtsmoos/Olam/eventListeners/userInput.js', 'utf8');
const inputProperties = fs.readFileSync('ckidsAwtsmoos/Olam/properties/InputProperties.js', 'utf8');
const actionBar = fs.readFileSync('ckidsAwtsmoos/Olam/uiManager/ui/gameUI/actionBar.js', 'utf8');
const combat = fs.readFileSync('ckidsAwtsmoos/systems/combat/CombatManager.js', 'utf8');
const weapons = fs.readFileSync('ckidsAwtsmoos/systems/combat/WeaponRegistry.js', 'utf8');

assert.match(manifest, /VILLAGE_WILDLIFE[\s\S]*Ember Fox[\s\S]*Shadow Wolf/, 'village wildlife manifest should define named mobs');
assert.match(manifest, /targetKills:\s*5/, 'village mission should require combat kills');
assert.match(layer, /new VillageAnimalMob/, 'battle layer must instantiate runtime mobs');
assert.match(layer, /registerEnemy/, 'battle layer must register mobs with combat manager');
assert.match(inputProperties, /"KeyV":\s*"ATTACK"/, 'V key should resolve to ATTACK');
assert.match(input, /key === "ATTACK"[\s\S]*combatManager\?\.attack/, 'ATTACK binding should fire through worker input');
assert.match(input, /Digit1[\s\S]*cherev_hakodesh[\s\S]*Digit3[\s\S]*mateh_hatorah/, 'number keys should equip weapons');
assert.match(actionBar, /attack-slot[\s\S]*combatAttack[\s\S]*bow-slot[\s\S]*staff-slot/, 'action bar should expose attack and weapons');
assert.match(combat, /resolveAimDirection/, 'combat manager should aim-assist projectiles');
assert.match(weapons, /\\u05d0[\s\S]*\\u05e9[\s\S]*letter:\s*"ALL"/, 'weapons should fire stable Hebrew letters');

console.log('B"H village combat training loop test passed');
