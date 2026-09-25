//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every physical surface and model before a finite renderer gives either form;
 * Awtsmoos.com proves remote identity, native hydration, isolated models, and portable geometry remain truthful through the storm.
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
	FIREBASE_MATERIAL_ORIGIN,
	MATERIALS,
	REMOTE_MATERIAL_ROOT,
	remoteMaterialUrl
} from "../js/materials/firebase-material-manifest.js";
import { PhysicalMaterialLibrary } from "../js/materials/physical-material-library.js";
import { readSevenSource } from "./test-source-reader.mjs";

const migrationRoot = "https://awtsmoos.com/sites/firebase_drive_migration";
const forbiddenRenderer = /THREE\.|three\.module|adapters\/three|GLTFLoader|SkeletonUtils|scripts\/jsm/;

test("manifest uses the verified remote migration transport only", () => {
	assert.equal(REMOTE_MATERIAL_ROOT, migrationRoot);
	assert.equal(FIREBASE_MATERIAL_ORIGIN, migrationRoot);
	for (const [role, record] of Object.entries(MATERIALS)) {
		assert.match(record.remoteUrl, /^https:\/\/awtsmoos\.com\/sites\/firebase_drive_migration\//, role);
		assert.equal(record.firebaseUrl, record.remoteUrl, role);
		assert.equal("localUrl" in record, false, role);
	}
});

test("remote URL builder encodes segments and rejects traversal", () => {
	assert.equal(remoteMaterialUrl("full-resolution/grass 5.png"), `${migrationRoot}/full-resolution/grass%205.png`);
	assert.throws(() => remoteMaterialUrl("../secret.png"), /unsafe relative material path/);
});

test("native material hydration owns bounded remote image readiness", () => {
	const facade = readSevenSource("js/materials/progressive-texture-cache.js");
	const store = readSevenSource("js/materials/native-seven-material-store.js");
	const entries = readSevenSource("js/materials/native-seven-material-entries.js");
	assert.match(facade, /mapImage|remote-ready|loading-remote/);
	assert.match(store, /NativeLayeredMaterialHydrator|beginSevenMaterialHydration/);
	assert.match(entries, /hydrationPriority|texturePolicy: 'repeat'/);
	assert.doesNotMatch(`${facade}\n${store}\n${entries}`, forbiddenRenderer);
});

test("physical facade begins native lazy hydration with verified remote identity", () => {
	const material = new PhysicalMaterialLibrary().material("masonry");
	assert.equal(material.name, "Seven masonry material");
	assert.equal(material.userData.materialRole, "masonry");
	assert.equal(material.userData.materialState, "pending");
	assert.match(material.textureUrl, /sites\/firebase_drive_migration/);
	assert.equal(Boolean(material.mapImage), false);
});

test("HTML preloads remote images and externally verified icon", () => {
	const html = readSevenSource("index.html");
	assert.match(html, /awtsmoos-material-project" content="firebase_drive_migration/);
	assert.match(html, /sites\/firebase_drive_migration\/various\/Stone%20retaining/);
	assert.match(html, /sites\/awtsmoos-release-assets\/icons\/mark\.svg/);
	assert.doesNotMatch(html, /games\/mitzvahWorld\/assets\/materials\/local/);
});

test("advanced models use cached native isolated loading and immutable public records", () => {
	const loader = readSevenSource("js/assets/gltf-model-library.js");
	const manifest = readSevenSource("js/assets/model-manifest.js");
	assert.match(loader, /createNativeModelAssetService/);
	assert.match(loader, /loadIsolated/);
	assert.doesNotMatch(loader, forbiddenRenderer);
	assert.match(manifest, /sites\/awtsmoos-release-assets\/models/);
	for (const model of ["Sheep.glb", "Cow.glb", "NormalTree_5.glb", "Rock_2.glb"]) {
		assert.match(manifest, new RegExp(model.replace(".", "\\.")));
	}
});

test("procedural fallbacks cache renderer-neutral native-ready geometry", () => {
	assert.match(readSevenSource("js/procedural/advanced-profile-factory.js"), /type: 'subdivide'/);
	const cache = readSevenSource("js/procedural/core-part-geometry-cache.js");
	assert.match(cache, /generateProceduralGeometry|renderDataByProfile/);
	assert.doesNotMatch(cache, forbiddenRenderer);
	const buildings = readSevenSource("js/procedural/building-detail-factory.js");
	for (const detail of ["foundation", "frame-v", "roof-ridge", "chimney", "buttress"]) {
		assert.match(buildings, new RegExp(detail));
	}
});

test("worlds remain continuous and shared materials survive disposal", () => {
	const scene = readSevenSource("js/webgl/scene-kit.js");
	const games = ["false-powers-game", "words-creation-game", "every-life-game"]
		.map(name => readSevenSource(`js/games3d/${name}.js`)).join("\n");
	assert.match(`${scene}\n${games}`, /Math\.hypot|distanceTo|ringPosition/);
	assert.doesNotMatch(`${scene}\n${games}`, /GridHelper|snapToGrid|tileIndex/i);
	assert.match(readSevenSource("js/webgl/stage-resources.js"), /sharedAsset/);
});
