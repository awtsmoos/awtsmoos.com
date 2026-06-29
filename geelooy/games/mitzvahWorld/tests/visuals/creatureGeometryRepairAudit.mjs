// B"H
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");

const material = read("ckidsAwtsmoos/rendering/backends/three/ThreeMaterialAdapter.js");
const geometry = read("ckidsAwtsmoos/rendering/backends/three/ThreeGeometryAdapter.js");
const coreGeometry = fs.readFileSync(path.resolve(root, "../../libs/awtsmoos-procedural-core/src/adapters/three/bufferGeometry.js"), "utf8");

assert(material.includes("creatureHints"), "animal material path must detect wildlife names");
assert(material.includes("THREE.DoubleSide"), "animal material path must allow double-sided repair");
assert(geometry.includes("!data.preserveNormals") && geometry.includes("computeVertexNormals()"), "game geometry must recompute generated normals");
assert(coreGeometry.includes("options.preserveNormals !== true") && coreGeometry.includes("computeVertexNormals()"), "procedural core geometry must recompute generated normals");

console.log("B\"H creature geometry repair audit passed.");
