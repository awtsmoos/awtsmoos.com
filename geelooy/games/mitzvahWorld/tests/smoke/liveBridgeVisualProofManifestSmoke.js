// B"H
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { writeVisualProofFrame, writeVisualProofManifest } from "../../ckidsAwtsmoos/systems/debug/visualProof/VisualProofWriter.js";
import { makeLiveBridgeFixture } from "../helpers/liveBridgeFixture.js";
import { visualProofFiles } from "../helpers/visualProof/VisualProofPaths.js";

const fixture = makeLiveBridgeFixture();
const chromeShot = "tests/headless/visual-proof/real-chrome-visual-audit.png";
const hasChromeShot = await exists(chromeShot);
const base = { bodies:fixture.bridge.world.bodies.values(), player:fixture.olam.player, animals:fixture.data.animals, npcs:fixture.data.npcs, hostiles:fixture.data.hostiles };
const entries = [];
entries.push(await writeVisualProofFrame(visualProofFiles.houseBlocked, { ...base, phase:"houseCollisionBlocked", title:"House Collision Blocked" }));
entries.push(await writeVisualProofFrame(visualProofFiles.animals, { ...base, phase:"animalsAboveGround", title:"Animals Above Ground" }));
entries.push(await writeVisualProofFrame(visualProofFiles.longRunFinal, { ...base, phase:"longRunFinal", title:"Long Run Final Frame" }));
if (hasChromeShot) entries.push({ phase:"realChromeVisualAudit", image:chromeShot, frame:0, violations:[] });
const manifest = await writeVisualProofManifest(visualProofFiles.manifest, entries, { browserScreenshot:hasChromeShot ? chromeShot : null });
const text = await readFile(visualProofFiles.manifest, "utf8");
assert(manifest.entries.length >= 3, "manifest records generated proof frames");
assert(text.includes("animalsAboveGround"), "manifest written to disk");
console.log("B'H liveBridgeVisualProofManifestSmoke passed");

async function exists(file) {
  try { await access(file); return true; } catch { return false; }
}
