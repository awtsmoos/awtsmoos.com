// B"H
// Boruch Hashem
// Blessed is He

export const FIREBASE_TEXTURE_PROJECT = 'awtsmoos-docs-base';
export const FIREBASE_TEXTURE_ORIGIN = 'https://awtsmoos-docs-base.web.app';
export const FIREBASE_TEXTURE_MANIFEST = `${FIREBASE_TEXTURE_ORIGIN}/awtsmoos-nature/chai-forest-half/manifest.json`;

const TEXTURE_RECORDS = Object.freeze([
	record('grass.jpg', '/awtsmoos-nature/chai-forest-half/textures/ground/grass.jpg', 73613),
	record('dirt_color.jpg', '/awtsmoos-nature/chai-forest-half/textures/ground/dirt_color.jpg', 59543),
	record('bluestone 1.png', '/half-resolution/bluestone%201.png', 682618),
	record('Bark002_1K-JPG_Color.jpg', '/awtsmoos-nature/chai-forest-half/textures/bark/Bark002_1K-JPG/Bark002_1K-JPG_Color.jpg', 50838),
	record('ash.png', '/awtsmoos-nature/chai-forest-half/textures/leaves/ash.png', 94056),
	record('oak.png', '/awtsmoos-nature/chai-forest-half/textures/leaves/oak.png', 106366),
	record('pine.png', '/awtsmoos-nature/chai-forest-half/textures/leaves/pine.png', 110708),
	record('silver 1.png', '/half-resolution/silver%201.png', 773835),
	record('oak wood 2.png', '/half-resolution/oak%20wood%202.png', 653668),
	record('seamless water brighter.png', '/full-resolution/seamless%20water%20brighter.png', 1895759)
]);

export const FIREBASE_TEXTURES = Object.freeze(Object.fromEntries(
	TEXTURE_RECORDS.map(entry => [entry.fileName, entry])
));

export const MATERIAL_DEFINITIONS = Object.freeze({
	none: material(null, 0, 1),
	grass: material('grass.jpg', 0.72, 0.014),
	dirt: material('dirt_color.jpg', 0.62, 0.022),
	stone: material('bluestone 1.png', 0.46, 0.018),
	bark: material('Bark002_1K-JPG_Color.jpg', 0.38, 0.055),
	wood: material('oak wood 2.png', 0.48, 0.038),
	metal: material('silver 1.png', 0.28, 0.026),
	parchment: material('dirt_color.jpg', 0.2, 0.045),
	foliage: botanical(null, 'ash.png', 0, 0.5, 0.07),
	treeAsh: botanical('Bark002_1K-JPG_Color.jpg', 'ash.png', 0.42, 0.48, 0.06),
	treeOak: botanical('Bark002_1K-JPG_Color.jpg', 'oak.png', 0.42, 0.48, 0.06),
	treePine: botanical('Bark002_1K-JPG_Color.jpg', 'pine.png', 0.42, 0.48, 0.06),
	water: material('seamless water brighter.png', 0.28, 0.006, [0.004, 0.002])
});

/** Resolve one exact filename into immutable public Hosting metadata. */
export function firebaseTextureRecord(fileName) {
	return FIREBASE_TEXTURES[fileName] || null;
}

/** Resolve one exact filename into its public Firebase Hosting URL. */
export function firebaseTextureUrl(fileName) {
	return firebaseTextureRecord(fileName)?.url || null;
}

/** Resolve a game-facing material while preserving the untextured fallback. */
export function materialDefinition(materialId = 'none') {
	return MATERIAL_DEFINITIONS[materialId] || MATERIAL_DEFINITIONS.none;
}

/** Return every distinct primary and secondary filename required by live materials. */
export function initialTextureFileNames() {
	const names = Object.values(MATERIAL_DEFINITIONS).flatMap(definition => [
		definition.primaryFileName,
		definition.secondaryFileName
	]);
	return [...new Set(names.filter(Boolean))];
}

/** Sum the bounded asynchronous transfer budget from verified Firebase records. */
export function initialTextureBytes() {
	return initialTextureFileNames().reduce((total, fileName) => {
		return total + (firebaseTextureRecord(fileName)?.bytes || 0);
	}, 0);
}

function record(fileName, path, bytes) {
	return Object.freeze({ fileName, path, url: `${FIREBASE_TEXTURE_ORIGIN}${path}`, bytes });
}

function material(primaryFileName, primaryMix, textureScale, flow = [0, 0]) {
	return freezeMaterial({ primaryFileName, primaryMix, textureScale, flow });
}

function botanical(primaryFileName, secondaryFileName, primaryMix, secondaryMix, textureScale) {
	return freezeMaterial({ primaryFileName, secondaryFileName, primaryMix, secondaryMix, textureScale, materialMode: 1 });
}

function freezeMaterial(options) {
	return Object.freeze({
		primaryFileName: options.primaryFileName || null,
		secondaryFileName: options.secondaryFileName || null,
		primaryMix: options.primaryMix || 0,
		secondaryMix: options.secondaryMix || 0,
		textureScale: options.textureScale || 1,
		materialMode: options.materialMode || 0,
		flow: Object.freeze([...(options.flow || [0, 0])])
	});
}
