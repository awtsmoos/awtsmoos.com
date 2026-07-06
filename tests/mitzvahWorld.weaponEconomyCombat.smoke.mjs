// B"H
import assert from "node:assert/strict";
import { installEquippedWeaponFeaturePack } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/equipment/runtime/EquippedWeaponFeaturePack.js";
import { installEconomyFeaturePack } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/economy/runtime/EconomyFeaturePack.js";
import { weaponGenreKeys } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/equipment/runtime/WeaponGenreCatalog.js";
import { weaponList } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/equipment/runtime/WeaponStatCatalog.js";
import { heldMeshRecipe } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/equipment/runtime/ProceduralHeldMeshCatalog.js";
import { missingTimingGenres, itemAttackTiming } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/combat/runtime/CombatAttackTimingCatalog.js";
import { merchantItems, merchantTypes } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/economy/runtime/MerchantInventoryRuntime.js";

const runtime = { entities:new Map(), ready:[], registerEntity(e){ this.entities.set(e.id,e); return e; }, markReady(k,v){ this.ready.push([k,v]); } };
const equipment = installEquippedWeaponFeaturePack(runtime);
const economy = installEconomyFeaturePack(runtime, { startingPerutas:5000 });

const requested = ["hands","knife","dagger","shortSword","longSword","greatSword","staff","wand","stick","club","spear","axe","hammer","bow","crossbow","hebrewBow","sling","throwingStone","farmingTool","craftingTool","trainingWeapon","holyWeapon","letterWeapon"];
assert.deepEqual(missingTimingGenres(), []);
for (const genre of requested) assert.ok(weaponGenreKeys().includes(genre), `missing genre ${genre}`);
for (const item of weaponList()) {
  assert.ok(item.damage >= 0, `${item.id} damage`);
  assert.ok(item.rightHandAttachment === "mixamorig:RightHand", `${item.id} hand`);
  assert.ok(heldMeshRecipe(item.id).parts.length > 0, `${item.id} recipe`);
  assert.ok(itemAttackTiming(item.id).cooldown >= itemAttackTiming(item.id).active, `${item.id} timing`);
}
assert.ok(merchantTypes().includes("bowyer"));
assert.ok(merchantItems("blacksmith").some(item => item.genre === "greatSword"));
assert.ok(merchantItems("scribe").some(item => item.genre === "hebrewBow"));
const before = economy.wallet.balance("player");
const buy = economy.buy("player", "bowyer", "hebrewBow");
assert.equal(buy.ok, true);
assert.ok(economy.wallet.balance("player") < before);
const sell = economy.sell("player", "bowyer", "hebrewBow");
assert.equal(sell.ok, true);
const equipped = equipment.equip("player", "hebrewBow", null);
assert.equal(equipped.itemId, "hebrewBow");
const shot = equipment.attack("player", "attack");
assert.equal(shot.projectile.letter, "א");
const hits = equipment.tickProjectiles(3, { regionId:"test_corrupted_region" });
assert.equal(hits.length, 1);
assert.equal(runtime.entities.get("test_corrupted_region").purified, true);
console.log("B'H mitzvahWorld.weaponEconomyCombat.smoke passed", { weapons:weaponList().length, merchants:merchantTypes().length, entities:runtime.entities.size });
