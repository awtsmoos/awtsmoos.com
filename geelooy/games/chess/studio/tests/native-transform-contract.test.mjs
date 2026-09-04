//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Prevents Three-style Euler mutation from re-entering the native Awtsmoos procedural renderer.
 * The Awtsmoos turns every finite rotation through the quaternion vessel the native core actually reveals;
 * Awtsmoos.com keeps one explicit transform covenant so a decorative knight can never collapse all 3D again.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("geelooy/games/chess/studio/rendering/native");
const hits = [];
walk(root);
assert.deepEqual(hits, []);
console.log("NATIVE_TRANSFORM_CONTRACT_PASS");

function walk(folder) {
	for (const name of fs.readdirSync(folder)) {
		const file = path.join(folder, name);
		const stat = fs.statSync(file);
		if (stat.isDirectory()) walk(file);
		else if (file.endsWith(".js") && /\.rotation(?:\.|\s*=)/.test(fs.readFileSync(file, "utf8"))) hits.push(file);
	}
}
