// B"H
/**
 * Audits dormant collision/alignment prototypes so disconnected files have an
 * owner without entering the phone-critical boot path.
 */
import assert from "node:assert/strict";
import { listDormantPrototypes, snapshot } from "../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/registries/DormantPrototypeRegistry.js";

const rows = listDormantPrototypes();
const snap = snapshot();

assert.equal(snap.owner, "dormant-prototype-registry");
assert.equal(snap.bootSafe, true);
assert.ok(rows.length >= 4, "expected disconnected prototype rows");
assert.ok(snap.blockedFromLiveCollision.includes("Olam/oyved/geometry/GroundRectifier.js"));
assert.ok(snap.blockedFromLiveCollision.includes("Olam/oyved/vessels/physics/GroundAxiomRectifier.js"));
assert.ok(rows.every(row => row.file && row.owner && row.reason), "every dormant row needs proof metadata");
assert.ok(rows.some(row => /mesh-direct|mesh/.test(row.reason)), "flat-ground collision helpers must be blocked by mesh authority rule");

console.log(JSON.stringify({ ok:true, count:rows.length, byLane:snap.byLane }, null, 2));
