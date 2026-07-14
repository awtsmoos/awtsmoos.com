//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AwtsmoosGamesDirectory
 * @description
 * The arcade is a constellation of distinct doorways. Awtsmoos.com gathers
 * their names in one small vessel, while each world keeps its own path, color,
 * and purpose beneath the constantly renewed light of the Awtsmoos.
 */
export const GAMES = [
	game('City of Light', './city-of-light/', 'A full 24-chapter generated pilgrimage with verified accessible platforms, living wildlife, authored missions, abilities, saves, weather, and procedural animation.', ['Expanded', 'Campaign', 'Generated', 'Mobile'], 48, '◇'),
	game('Seven Mitzvos', './seven-mitzvos/', 'Two games in one: master fast moral scenarios, then build and defend a top-down Covenant City with farms, resources, upgrades, crises, tiers, and all seven mitzvos.', ['New', 'Strategy', 'Builder', 'Learning', 'Fast', 'Mobile'], 38, '⚖️'),
	game('Nitzotz.io', './nitzotz-io/', 'Raw WebGL spark-gathering arena inspired by Hole.io, transformed into Kabbalah: reveal hidden sparks and grow the vessel.', ['New', 'WebGL', 'Mobile'], 212, '🕯️'),
	game('Sefira Clash', './sefira-clash/', 'Arena fighter with mystical smash-style combat, bots, power-ups, and huge maps.', ['New', 'Fighting', 'Mobile'], 44, '👊'),
	game('Mitzvah World', './mitzvahWorld/', 'A wandering mitzvah adventure through playful worlds.', ['Adventure'], 132, '🌍'),
	game('Ohr Hagnuz', './ohr-hagnuz/', 'Hidden light, arcade motion, and glowing mystery.', ['Arcade'], 52, '💡'),
	game('Brick Blast', './brick-blast/', 'Fast brick-breaking action.', ['Arcade'], 14, '🧱'),
	game('Sulam HaSod', './sulam-ha-sod/', 'Climb the secret ladder of worlds.', ['Platform'], 280, '🪜'),
	game('KAVANAH', './KAVANAH/', 'Focus, intention, and luminous play.', ['Mystic'], 205, '🎯'),
	game('Shema Strike', './shema-strike/', 'Strike through rhythm and sacred sound.', ['Action'], 190, '⚡'),
	game('Emojis', './emojis/', 'A colorful emoji playground.', ['Casual'], 320, '😀'),
	game('Chess', './chess/', 'Classic strategy board combat.', ['Board'], 36, '♟️'),
	game('Connect 4', './connect4/', 'Drop pieces and connect four.', ['Board'], 8, '🔴'),
	game('Pong', './pong/', 'The eternal duel of paddle and ball.', ['Classic'], 168, '🏓'),
	game('Tetris', './tetris/', 'Falling blocks, clean lines, endless pressure.', ['Classic'], 250, '▦'),
	game('Nachash', './Nachash/', 'Snake reborn as Nachash.', ['Classic'], 100, '🐍'),
	game("Noah's Dove Jump", './dove/', 'Leap with the dove through a flood of motion.', ['Platform'], 210, '🕊️'),
	game('Soul Jump', './soul-jump/', 'A fiery vertical climb of the soul.', ['Platform'], 28, '🔥'),
	game('Neshama Quest', './neshama-quest/', 'Quest through soul-world challenges.', ['Adventure'], 265, '✨'),
	game("The Scribe's Journey", './scribe-journey/', 'Letters, ink, and the road of the scribe.', ['Story'], 48, '✍️'),
	game('Kabbalah Shooter', './kabbalah-shooter/', 'Mystic shooter arcade action.', ['Shooter'], 300, '🌌'),
	game('Migdol', './migdol/', 'Build, climb, and face the tower.', ['Arcade'], 70, '🗼'),
	game('Cards', './cards/', 'A simple card table for quick play.', ['Cards'], 22, '🃏'),
	game("The Rebbe's Runner", './rebbe-runner/', 'Run forward with joy and speed.', ['Runner'], 155, '🏃')
];

/**
 * Shapes one directory record without hiding any runtime behavior.
 *
 * @param {string} title Visible game title.
 * @param {string} href Relative doorway.
 * @param {string} description Short invitation.
 * @param {string[]} tags Searchable categories.
 * @param {number} hue Card accent hue.
 * @param {string} icon Compact visual sign.
 * @returns {Object} One immutable-looking directory record.
 */
function game(title, href, description, tags, hue, icon) {
	return { title, href, description, tags, hue, icon };
}
