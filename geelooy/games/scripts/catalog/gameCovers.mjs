//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file gameCovers.mjs
 * @description
 * Maps every game ID to its unique Drive-hosted cover image.
 * Yaakov 2026-10-13: EVERY game gets its own stunning cover.
 */

const COVER_BASE = "https://awtsmoos.com/api/social/drive/public/awtsmoos/covers/games";
const COVER_V = "?v=20261013b";

const GAME_COVERS = {
	"temple-runner": "game-temple-runner.webp",
	"cobyk": "game-cobyk.webp",
	"merkava": "game-merkava.webp",
	"ohrfront": "game-ohrfront.webp",
	"sefira-clash": "game-sefira-clash.webp",
	"nitzotz-io": "game-nitzotz-io.webp",
	"shema-strike": "game-shema-strike.webp",
	"oros-ha-kelim": "game-oros-hakelim.webp",
	"awtsmoos-bounce": "game-bounce.webp",
	"seven-mitzvos": "game-seven-mitzvos.webp",
	"city-of-light": "game-city-of-light.webp",
	"ohr-hagnuz": "game-ohr-hagnuz.webp",
	"scribe-journey": "game-scribe-journey.webp",
	"mitzvah-world": "game-mitzvah-world.webp",
	"rambam": "game-rambam.webp",
	"sulam-ha-sod": "game-sulam-hasod.webp",
	"kavanah": "game-kavanah.webp",
	"neshama-quest": "game-neshama-quest.webp",
	"kabbalah-shooter": "game-kabbalah-shooter.webp",
	"migdol": "game-migdol.webp",
	"soul-jump": "game-soul-jump.webp",
	"noahs-dove": "game-dove.webp",
	"rebbe-runner": "game-rebbe-runner.webp",
	"adventure": "game-adventure.webp",
	"ohrbound": "game-ohrbound.webp",
	"nachash": "game-nachash.webp",
	"brick-blast": "game-brick-blast.webp",
	"chess": "game-chess.webp",
	"tetris": "game-tetris.webp",
	"connect-4": "game-connect4.webp",
	"pong": "game-pong.webp",
	"cards": "game-cards.webp",
	"emojis": "game-emojis.webp",
};

/**
 * Returns the cover image URL for a game ID, or null if none.
 * @param {string} gameId
 * @returns {string|null}
 */
export function getGameCoverUrl(gameId) {
	const file = GAME_COVERS[gameId];
	if (!file) return null;
	return `${COVER_BASE}/${file}${COVER_V}`;
}

/**
 * Returns the cover <img> markup for a game card.
 * @param {string} gameId
 * @param {string} title
 * @returns {string}
 */
export function renderGameCover(gameId, title) {
	const url = getGameCoverUrl(gameId);
	if (!url) return "";
	const safeTitle = String(title || "").replace(/"/g, "&quot;").replace(/</g, "&lt;");
	return `<span class="gameCover"><img src="${url}" alt="${safeTitle} cover art" loading="lazy" decoding="async"></span>`;
}
