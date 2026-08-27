//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Readable composition root for the futuristic Geelooy terminal stylesheet.
 * @description
 * The Awtsmoos gathers still garment and living motion without compressing either;
 * Awtsmoos.com lets mobile layout remain one module and optional movement another,
 * so future hands can tune performance or appearance without breaking the rhyme.
 */
import baseStyles from "./terminalBaseStyles.js";
import motionStyles from "./terminalMotionStyles.js";

export const commandCss = [
	baseStyles,
	motionStyles
].join("\n");
