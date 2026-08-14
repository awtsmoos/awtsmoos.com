// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

const ALIAS_ID = "awtsmoos-release-assets";
const PUBLIC_ROOT = `/sites/${ALIAS_ID}/`;

/**
 * @file Names source-external product payload without putting its bytes back into Git.
 * @description The Awtsmoos keeps logical identity in source while Awtsmoos.com lets the
 * heavy vessel live in hash-addressed public Drive storage beyond the deploy repository.
 */
const ENTRIES = Object.freeze([
	entry("cowModel", "games/models/cow.glb", "geelooy/games/mitzvahWorld/assets/models/Cow.glb", "model/gltf-binary"),
	entry("sheepModel", "games/models/sheep.glb", "geelooy/games/mitzvahWorld/assets/models/Sheep.glb", "model/gltf-binary"),
	entry("normalTreeModel", "games/models/normal-tree.glb", "geelooy/games/mitzvahWorld/assets/models/NormalTree.glb", "model/gltf-binary"),
	entry("pineTreeModel", "games/models/pine-tree.glb", "geelooy/games/mitzvahWorld/assets/models/PineTree.glb", "model/gltf-binary"),
	entry("scrollModel", "games/models/scroll.glb", "geelooy/games/mitzvahWorld/assets/models/Scroll.glb", "model/gltf-binary"),
	entry("homeHero", "home/restored-awtsmoos-hero.jpg", "geelooy/resources/home/restored-awtsmoos-hero.jpg", "image/jpeg"),
	entry("codeIcons", "apps/code/icons.svg", "geelooy/apps/code/assets/icons.svg", "image/svg+xml"),
	entry("sevenMitzvosFavicon", "games/seven-mitzvos/favicon.svg", "geelooy/games/seven-mitzvos/favicon.svg", "image/svg+xml"),
	entry("merkavaVirtualDomFixture", "tests/merkava/virtual-dom-complex.svg", "geelooy/scripts/awtsmoos/MerkavaExecutor/.ect-virtual-dom-complex.svg", "image/svg+xml")
]);

function entry(id, remotePath, localPath, mime) {
	return Object.freeze({ id, remotePath, localPath, mime, publicUrl: `${PUBLIC_ROOT}${remotePath}` });
}

function byId(id) {
	return ENTRIES.find(item => item.id === id) || null;
}

function absoluteLocalPath(projectRoot, item) {
	return path.resolve(projectRoot, item.localPath);
}

module.exports = { ALIAS_ID, ENTRIES, PUBLIC_ROOT, absoluteLocalPath, byId };
