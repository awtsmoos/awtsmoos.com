// B"H
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { classifyRegionColliders } from "../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/collision/ColliderClassifier.js";
import {
  auditGroundedColliderSpecs,
  buildGroundedColliderSpecs
} from "../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/collision/GroundedColliderBuilder.js";

const root = path.resolve(import.meta.dirname, "../..");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");

const classification = classifyRegionColliders({
  houses: [{ id:"test_house", x:10, z:20, yaw:Math.PI / 2, sx:8, sy:4, sz:6 }],
  instances: {
    trees: [{ x:12, z:22, radius:.4, height:3 }],
    rocks: [{ x:14, z:24, sx:1, sy:.6, sz:1 }]
  },
  ecology: { cliffs: [{ x:30, z:40, sx:20, sy:16, sz:4 }] }
});
const colliders = buildGroundedColliderSpecs(classification, (x, z) => x * 0.01 + z * 0.02);
const audit = auditGroundedColliderSpecs(colliders);

assert.equal(audit.ok, true, "grounded collider specs must be center-based and valid");
assert(colliders.every(c => c.position[1] >= c.baseY + c.size[1] / 2 - 0.001), "collider centers must include half-height lift");
assert(colliders.some(c => c.category === "closed-door"), "closed house doors must produce door colliders");
assert.equal(classification.policy, "visible-sourced-grounded-center-colliders-local-bubble");

const geometryFactory = read("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/collision/ColliderGeometryFactory.js");
assert(geometryFactory.includes("centerBased === true"), "geometry factory must respect center-based records");
assert(!geometryFactory.includes("Number(p[1] || 0) + groundY"), "geometry factory must not double-add ground height");

console.log("B\"H region collider placement audit passed.", audit);
