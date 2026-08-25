//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Single readable composition root for the futuristic File Explorer theme.
 * @description
 * The Awtsmoos gathers many visual garments without compressing them into one
 * hidden breath. Awtsmoos.com lets frame, world state, dialogs, SSH, mobile
 * geometry, and motion remain separate vessels while one ordered stylesheet rhymes.
 */
import tokens from "./future/tokens.js";
import frame from "./future/frame.js";
import toolbar from "./future/toolbar.js";
import drives from "./future/drives.js";
import driveCards from "./future/driveCards.js";
import sidebar from "./future/sidebar.js";
import remoteStates from "./future/remoteStates.js";
import viewGrid from "./future/viewGrid.js";
import details from "./future/details.js";
import path from "./future/path.js";
import menus from "./future/menus.js";
import dialogs from "./future/dialogs.js";
import dialogDesktop from "./future/dialogDesktop.js";
import sshDrive from "./future/sshDrive.js";
import sshDriveAdd from "./future/sshDriveAdd.js";
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
	remoteStates,
	viewGrid,
	details,
	path,
	menus,
	dialogs,
	dialogDesktop,
	sshDrive,
	sshDriveAdd,
	scrollbars,
	mobile,
	interaction,
	motion
];

export default STYLE_MODULES.join("\n");
