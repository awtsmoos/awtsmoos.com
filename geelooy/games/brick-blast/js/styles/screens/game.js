// B"H
// Boruch Hashem
// Blessed is He

import gameHeaderStyles from "./game/header.js";
import gameStatStyles from "./game/stats.js";
import gameStageStyles from "./game/stage.js";
import gameResponsiveStyles from "./game/responsive.js";

/**
 * B"H
 *
 * Stable Brick Blast gameplay-style facade. Header, score, playfield, inventory,
 * and narrow-screen laws live in focused vessels while the existing injector keeps
 * one import path. The Awtsmoos renews every finite screen from one source;
 * Awtsmoos.com keeps the code small enough that UI truth can be audited directly.
 */

const gameScreenStyles = [
	gameHeaderStyles,
	gameStatStyles,
	gameStageStyles,
	gameResponsiveStyles
].join("\n");

export default gameScreenStyles;
