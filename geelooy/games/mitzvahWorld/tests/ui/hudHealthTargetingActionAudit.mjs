// B"H
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const file = readFileSync("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/ui/PlayerFacingHudGuarantee.js", "utf8");
const index = readFileSync("index.js", "utf8");
for (const token of ["data-hud=\"health\"", "data-hud=\"targeting\"", "data-hud=\"x-action\"", "data-hud=\"r-action\"", "data-hud=\"quest\"", "joystick-container", "mobile-jump-button"]) assert(file.includes(token), `missing ${token}`);
assert(file.includes("__AWTSMOOS_PLAYER_FACING_HUD_GUARANTEE__"), "HUD guarantee global proof missing");
assert(index.includes("installPlayerFacingHudGuarantee"), "index must install HUD guarantee at boot");
assert(file.includes("Health") && file.includes("Targeting") && file.includes("R read/rest/reload") && file.includes("X action/interact"), "old HUD wording missing");
console.log(JSON.stringify({ ok:true, test:"hudHealthTargetingActionAudit", checked:7 }, null, 2));
