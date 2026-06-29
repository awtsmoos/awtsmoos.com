// B"H
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");

const ray = read("ckidsAwtsmoos/Olam/math/OctreeWorld/methods/rayIntersect.js");
const capsule = read("ckidsAwtsmoos/Olam/math/OctreeWorld/methods/capsuleIntersect.js");
const bubble = read("ckidsAwtsmoos/Olam/math/OctreeWorld/methods/query/CollisionBubbleQuery.js");

assert(ray.includes("rayBubbleBox"), "ray collision must build a local bubble");
assert(ray.includes("leafNodesInsideBubble"), "ray collision must query local leaves only");
assert(!ray.includes("_findLeafNodesInBox(this.root, this.root.box)"), "ray collision must not scan the whole root box");
assert(capsule.includes("capsuleBubbleBox"), "capsule collision must share the bubble query helper");
assert(bubble.includes("MAX_RAY_RADIUS = 180"), "ray bubble must have a hard radius cap");
assert(bubble.includes("localOnly: true"), "bubble stats must expose local-only policy");

console.log("B\"H octree bubble query audit passed.");
