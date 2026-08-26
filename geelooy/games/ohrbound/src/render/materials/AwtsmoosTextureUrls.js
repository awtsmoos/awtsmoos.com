//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file AwtsmoosTextureUrls.js
 * @description Names only texture files already verified on the Awtsmoos production mirror.
 * The Awtsmoos needs no borrowed garment to reveal a world in light;
 * Awtsmoos.com serves these finite textures from its own vessel so every path stays right.
 */
export const AWTSMOOS_TEXTURE_ROOT =
	"https://awtsmoos.com/sites/firebase_drive_migration/full-resolution/";

export const VERIFIED_TEXTURE_FILES = Object.freeze({
	grass: "grass 4.png",
	cobblestone: "cobblestone.png",
	dirtGrass: "dirt grass 3.png",
	dirt: "dirt 2.png",
	rustyIron: "rusty iron.png",
	copper: "copper 1.png",
	granite: "polished granite Rock 1.png",
	silver: "silver 1.png",
	oak: "oak wood 3.png",
	planks: "wooden oak planks 1.png",
	gold: "gold 2.png",
	fieldstone: "weathered fieldstone Rock 1.png",
	stoneFloor: "stone floor 2.png",
	forestFloor: "dark forest floor nonlight.png"
});

/** Converts one verified filename into its canonical same-project production URL. */
export function awtsmoosTextureUrl(filename) {
	if (!Object.values(VERIFIED_TEXTURE_FILES).includes(filename)) {
		throw new Error(`Unverified Ohrbound texture: ${filename}`);
	}
	return AWTSMOOS_TEXTURE_ROOT + encodeURIComponent(filename);
}

/** Builds a frozen material descriptor with a stable renderer texture key. */
export function awtsmoosMaterial(id, filename, color, scale = 1) {
	return Object.freeze({
		texture: `ohrbound:${id}`,
		url: awtsmoosTextureUrl(filename),
		color: Object.freeze([...color]),
		scale,
		triplanar: true
	});
}
