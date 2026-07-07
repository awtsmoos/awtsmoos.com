// B"H
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { damagePlayerHealth, ensurePlayerHealthState, healPlayerHealth, playerHealthSnapshot } from "../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/runtime/PlayerHealthState.js";

ensurePlayerHealthState({ current:80, max:100 });
assert.equal(playerHealthSnapshot().current, 80);
damagePlayerHealth(55, "audit damage");
let damaged = playerHealthSnapshot();
assert.equal(damaged.current, 25);
assert.equal(damaged.low, true);
assert.equal(damaged.finite, true);
healPlayerHealth(30, "audit heal");
let healed = playerHealthSnapshot();
assert.equal(healed.current, 55);
assert.equal(healed.dead, false);
assert.equal(healed.finite, true);
const hud = readFileSync("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/ui/PlayerFacingHudGuarantee.js", "utf8");
assert(hud.includes("__AWTSMOOS_PLAYER_HEALTH_STATE__"), "HUD must read player health state");
assert(hud.includes("low") && hud.includes("Health"), "HUD must show low-health feedback and health label");
console.log(JSON.stringify({ ok:true, test:"healthStateAndUiAudit", damaged, healed }, null, 2));
