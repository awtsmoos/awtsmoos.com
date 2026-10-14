// B"H
/**
 * @module textureTiles
 * @description Real photographic/hand-painted ground textures for scribe-journey
 * terrain tiles. Replaces the flat WORLD_THEME fillStyle colors; the emoji tile
 * glyphs draw on top of texture. Falls back to flat colors until each texture
 * loads — the game never breaks on art load.
 */
const SOURCES = Object.freeze({
	grass: "https://awtsmoos.com/api/social/drive/public/awtsmoos/games/ohr-hagnuz/art/grass-tile.png?v=6985f387be",
	path: "https://awtsmoos.com/api/social/drive/public/awtsmoos/games/ohr-hagnuz/art/dirt-tile.webp?v=3e16c11795",
	water: "https://awtsmoos.com/api/social/drive/public/firebase_drive_migration/full-resolution/seamless%20water%20brighter.png?v=fc07dac93a",
	stone: "https://awtsmoos.com/api/social/drive/public/firebase_drive_migration/full-resolution/stone%201.png?v=b1c1ef4e64",
	sand: "https://awtsmoos.com/api/social/drive/public/firebase_drive_migration/full-resolution/dirt%202.png?v=c1b328c362",
	mystic: "https://awtsmoos.com/api/social/drive/public/firebase_drive_migration/full-resolution/stone%201.png?v=b1c1ef4e64",
});

const cache = {};
const readyFlags = {};

function loadOne(name, url) {
	return new Promise((resolve) => {
		if (typeof Image === "undefined") return resolve(null);
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			cache[name] = img;
			readyFlags[name] = true;
			resolve(img);
		};
		img.onerror = () => resolve(null);
		img.src = url;
	});
}

if (typeof window !== "undefined") {
	for (const [name, url] of Object.entries(SOURCES)) {
		void loadOne(name, url);
	}
}

/**
 * @param {string} surface One of grass|path|water|stone|sand|mystic.
 * @returns {HTMLImageElement|null} Loaded texture, or null while loading/failed.
 */
export function tileTexture(surface) {
	return readyFlags[surface] ? cache[surface] : null;
}
