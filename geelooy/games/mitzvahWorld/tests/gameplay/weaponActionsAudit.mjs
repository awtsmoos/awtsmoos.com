// B"H
import assert from "node:assert/strict";
import { resolveCombatAnimation } from "../../ckidsAwtsmoos/equipment/runtime/CombatAnimationResolver.js";
import { equipmentById } from "../../ckidsAwtsmoos/equipment/runtime/EquipmentItemCatalog.js";
import { installEquippedWeaponFeaturePack } from "../../ckidsAwtsmoos/equipment/runtime/EquippedWeaponFeaturePack.js";

const oneHand = resolveCombatAnimation({ item:equipmentById("simpleSword"), action:"attack" });
const twoHand = resolveCombatAnimation({ item:equipmentById("cedarGreatSword"), action:"attack" });
const staffMelee = resolveCombatAnimation({ item:equipmentById("woodenStaff"), action:"attack" });
const staffCast = resolveCombatAnimation({ item:equipmentById("learnerStaff"), action:"cast" });
const bowHold = resolveCombatAnimation({ item:equipmentById("cedarBow"), phase:"hold" });
const bowRelease = resolveCombatAnimation({ item:equipmentById("cedarBow"), phase:"release" });
const customBow = resolveCombatAnimation({ item:equipmentById("hebrewBow"), phase:"release", charged:true });

assert.equal(oneHand.reason, "one_hand_slash_right", "single-hand sword action must resolve");
assert.equal(twoHand.reason, "two_hand_heavy_slash", "two-hand sword action must resolve");
assert.equal(staffMelee.reason, "staff_swing", "staff melee action must resolve");
assert.equal(staffCast.reason, "staff_cast", "staff casting action must resolve");
assert.equal(bowHold.reason, "bow_draw_hold", "bow draw action must resolve");
assert.equal(bowRelease.reason, "bow_release", "bow release action must resolve");
assert.equal(customBow.reason, "hebrew_letter_release", "custom bow special must resolve");
assert.equal(customBow.projectile, "hebrew-letter", "custom bow special must create a visible projectile path");
assert(equipmentById("cedarGreatSword").knockback > 0 && equipmentById("cedarGreatSword").stagger > 0, "two-hand sword must carry stagger/knockback stats");

const registered = [];
const runtime = { registerEntity:entity => registered.push(entity), markReady:() => {} };
const pack = installEquippedWeaponFeaturePack(runtime);
const attack = pack.attack("player", "attack", { phase:"release" });
assert(attack.animation?.plan || attack.animation, "attack must create an animation plan");
assert(registered.some(entity => entity.kind === "equipmentItem"), "equipment items must register for visible hand use");
assert(pack.snapshot().impacts.count === 0, "impact runtime must be installed before hits happen");
console.log(JSON.stringify({ ok:true, audit:"weaponActionsAudit", reasons:[oneHand.reason, twoHand.reason, staffMelee.reason, staffCast.reason, bowHold.reason, bowRelease.reason, customBow.reason] }, null, 2));
