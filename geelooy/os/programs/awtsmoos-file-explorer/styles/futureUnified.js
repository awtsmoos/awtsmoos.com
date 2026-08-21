//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Single readable composition root for the futuristic File Explorer theme.
 * @description
 * The Awtsmoos gathers many visual garments without compressing them into one
 * hidden breath. Awtsmoos.com lets frame, drives, dialogs, SSH, mobile geometry,
 * and motion remain separate modules while one ordered stylesheet carries the rhyme.
 */
import tokens from "./future/tokens.js";
import frame from "./future/frame.js";
import toolbar from "./future/toolbar.js";
import drives from "./future/drives.js";
import driveCards from "./future/driveCards.js";
import sidebar from "./future/sidebar.js";
import viewGrid from "./future/viewGrid.js";
import details from "./future/details.js";
import path from "./future/path.js";
import menus from "./future/menus.js";
import dialogs from "./future/dialogs.js";
import sshDrive from "./future/sshDrive.js";
import scrollbars from "./future/scrollbars.js";
import mobile from "./future/mobile.js";
import interaction from "./future/interaction.js";
import motion from "./future/motion.js";

const STYLE_MODULES = [
	tokens,
	frame,
	toolbar,
	drives,
	driveCards,
	sidebar,
	viewGrid,
	details,
	path,
	menus,
	dialogs,
	sshDrive,
	scrollbars,
	mobile,
	interaction,
	motion
];

export default STYLE_MODULES.join("\n");
