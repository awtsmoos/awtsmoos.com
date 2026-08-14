// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

const ALIAS_ID = "awtsmoos-release-assets";
const PUBLIC_ROOT = `https://awtsmoos.com/sites/${ALIAS_ID}/`;
const MATERIAL_ROOT = "https://awtsmoos.com/sites/firebase_drive_migration/catalog/";

/** @file Records externally verified release payload by immutable byte identity. */
const ENTRIES = Object.freeze([
	entry("codeIcons", "apps/code/icons.svg", "geelooy/apps/code/assets/icons.svg", "image/svg+xml", "c71dbf2fd2235a2917ca435d9defbd4fe2949e5c5be6bf73dfc95caf206390d0", 7886),
	entry("sevenMitzvosMark", "icons/mark.svg", "geelooy/games/seven-mitzvos/favicon.svg", "image/svg+xml", "dd2378bb6e0c98e2e5435dc549b0bc476204881ff0c17e6749292f4a6ddba354", 637),
	entry("merkavaFixture", "tests/merkava/virtual-dom-complex.svg", "geelooy/scripts/awtsmoos/MerkavaExecutor/.ect-virtual-dom-complex.svg", "image/svg+xml", "e495c9a8231dd44e5f531d7e44e5e8a4eecbe2c1db9d7a76ccaceac6b304e740", 1618),
	model("rock", "10783ce0a1956b1c2c6879f7dba303b39fbe8f92256fe910b270f2f3b5d4e3ac", "Rock_2.glb", 11144),
	model("cow", "1d513ef5e3cba976405b68621905aa1954b7c7b673f0566bb3ac0135c330af6f", "Cow.glb", 370816),
	model("pine", "2e2061c8d5ed2a9beff3fa4f2e95967c9dfc554407c464278b2a0af13b29c204", "PineTree_3.glb", 56980),
	model("woodenStaff", "3bfba08a3426be1c873f49a85aef21c3fc670514218b606941d232ab5f2aad16", "WoodenStaff.glb", 12652),
	model("book", "3f6d8148030077aa95b035ca4d7f5ad589483806416fbd9b75546f49b5cce4c1", "Book.glb", 11684),
	model("tree", "5391f680617b2f8f5c7d0d8dbae1c18e6cd2f0e3795a6e4e0902110e3f5c51d5", "NormalTree_5.glb", 94036),
	model("sheep", "5da91ccae57ada6213ec6818760c37d47f2ce071fad6a5bb7426283439c71319", "Sheep.glb", 293680),
	model("scroll", "5e8581b1041eeae144e12b12b295eda498a8f9b52218065a7b76307cb1bd4ec9", "Scroll.glb", 52704),
	model("bush", "cdb6c9e558a3c9b3a42eafbc2f3580767cea8b79be625bfdd41369080b468bf6", "Bush_Large_Flowers.glb", 26788),
	model("flower", "ec4c5186b8b33b8095b5e8a4f733cfed1b21e876cf40f0ea9ea14537066592b9", "Flower_4_Clump.glb", 4868)
]);
const EXTERNAL_ENTRIES = Object.freeze([
	external("materialInventory", `${MATERIAL_ROOT}asset-inventory.json`, "9a46651ea47ab39e4211d1e541698c7e0dd3b444a2efe9e93df38b532c315f80", 768033),
	external("materialCatalog", `${MATERIAL_ROOT}materials.json`, "61aeb3d8280de1a4ad827fc53824cff73f5023775f98d767dbbef24231794ad9", 717636)
]);

function model(id, sha256, file, bytes) {
	return entry(id, `models/${sha256}.glb`, `geelooy/games/seven-mitzvos/assets/models/reference-world/${sha256}/${file}`, "model/gltf-binary", sha256, bytes);
}

function entry(id, remotePath, sourcePath, mime, sha256, bytes) {
	return Object.freeze({ id, remotePath, sourcePath, mime, sha256, bytes, publicUrl: `${PUBLIC_ROOT}${remotePath}` });
}

function external(id, publicUrl, sha256, bytes) {
	return Object.freeze({ id, publicUrl, sha256, bytes });
}

function absoluteSourcePath(sourceRoot, item) {
	return path.resolve(sourceRoot, item.sourcePath);
}

module.exports = { ALIAS_ID, ENTRIES, EXTERNAL_ENTRIES, PUBLIC_ROOT, absoluteSourcePath };
