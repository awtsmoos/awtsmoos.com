// B"H
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { damagePlayerHealth, ensurePlayerHealthState, healPlayerHealth, playerHealthSnapshot } from "../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/runtime/PlayerHealthState.js";
const scene = JSON.parse(readFileSync("data/universe/examples/chossidBusyActionGameplayScene.json", "utf8"));
for (const weapon of ["singleHandSword", "twoHandSword", "staff", "bow"]) assert(scene.player.weapons.includes(weapon), `missing weapon ${weapon}`);
const monster = scene.targets.find(t => t.type === "monster");
assert(monster && monster.health > 0, "monster target must have health");
ensurePlayerHealthState({ current:100, max:100 });
damagePlayerHealth(10, "weapon audit incoming hit");
assert.equal(playerHealthSnapshot().current, 90, "damage must mutate health");
healPlayerHealth(5, "weapon audit heal");
assert.equal(playerHealthSnapshot().current, 95, "healing must mutate health");
console.log(JSON.stringify({ ok:true, test:"weaponActionsTargetHealthAudit", weapons:scene.player.weapons, monster, player:playerHealthSnapshot() }, null, 2));
