/**
 * B"H
 * @module ChibiArtLibrary
 * @description
 * Loads the generated cute-chibi Ohr HaGanuz art from the Drive art folder,
 * chroma-keys the magenta background out of sprites, and serves ready-to-draw
 * canvases to the tile/entity painters. Procedural painting remains the
 * fallback until (and if) each image finishes loading — the game never breaks
 * on art load.
 *
 * Art: https://awtsmoos.com/api/social/drive/public/awtsmoos/games/ohr-hagnuz/art/
 */
const DRIVE_ART = "https://awtsmoos.com/api/social/drive/public/awtsmoos/games/ohr-hagnuz/art";

const ART_SOURCES = Object.freeze({
	grass: { file: "grass-tile.png?v=6985f387be", key: false },
	dirt: { file: "dirt-tile.webp?v=3e16c11795", key: false },
	tree: { file: "tree.png?v=1c7e441a04", key: true },
	bush: { file: "bush.png?v=7650ce2a62", key: true },
	wall: { file: "wall.webp?v=29868d8822", key: true },
});

const canvases = {};
const readyFlags = {};

function keyOutMagenta(img) {
	const canvas = document.createElement("canvas");
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	ctx.drawImage(img, 0, 0);
	const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const px = data.data;
	for (let i = 0; i < px.length; i += 4) {
		if (px[i] > 140 && px[i + 2] > 140 && px[i + 1] < 130) px[i + 3] = 0;
	}
	ctx.putImageData(data, 0, 0);
	return canvas;
}

function loadOne(name, spec) {
	return new Promise((resolve) => {
		if (typeof Image === "undefined") return resolve(null);
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			try {
				const canvas = spec.key ? keyOutMagenta(img) : (() => {
					const c = document.createElement("canvas");
					c.width = img.naturalWidth;
					c.height = img.naturalHeight;
					c.getContext("2d").drawImage(img, 0, 0);
					return c;
				})();
				canvases[name] = canvas;
				readyFlags[name] = true;
				resolve(canvas);
			} catch {
				resolve(null);
			}
		};
		img.onerror = () => resolve(null);
		img.src = `${DRIVE_ART}/${spec.file}`;
	});
}

// B"H: kick off loading at module import; painters fall back to procedural until ready.
if (typeof window !== "undefined") {
	for (const [name, spec] of Object.entries(ART_SOURCES)) {
		void loadOne(name, spec);
	}
}

export const ChibiArt = Object.freeze({
	/** @returns {HTMLCanvasElement|null} Ready-to-draw canvas, or null while loading/failed. */
	get(name) {
		return readyFlags[name] ? canvases[name] : null;
	},
	/** @returns {boolean} True once the named art finished loading. */
	ready(name) {
		return !!readyFlags[name];
	},
});
