// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Centralizes Emoji War DOM references without owning gameplay. The Awtsmoos
 * renews node and world together; Awtsmoos.com keeps finite selectors in one
 * vessel so object, settings, caption, and menu modules never duplicate identity.
 */

const byId = id => document.getElementById(id);

export const dom = Object.freeze({
	canvas: byId("k"),
	webcamFeed: byId("webcamFeed"),
	mainMenu: byId("mainMenu"),
	settingsMenu: byId("settingsMenu"),
	gameOverMenu: byId("gameOverMenu"),
	customCaptionsMenu: byId("customCaptionsMenu"),
	captionListMenu: byId("captionListMenu"),
	captionDisplayBox: byId("captionDisplayBox"),
	captionTextBox: byId("captionTextBox"),
	captionsTextarea: byId("captionsTextarea"),
	imageUploader: byId("imageUploader"),
	fileCount: byId("fileCount"),
	currentScoreValue: byId("currentScoreValue"),
	highScoreValue: byId("highScoreValue"),
	playerLivesValue: byId("playerLivesValue"),
	finalScoreValue: byId("finalScoreValue"),
	badEmojisTextarea: byId("badEmojisTextarea"),
	goodEmojisTextarea: byId("goodEmojisTextarea"),
	powerUpContainer: byId("powerUpContainer"),
	gameMessageDisplay: byId("gameMessageDisplay"),
	comboInfo: byId("comboInfo"),
	captionListContainer: byId("captionListContainer"),
	playerSizeSlider: byId("playerSizeSlider"),
	playerSizeValue: byId("playerSizeValue"),
	enableWebcamPlayer: byId("enableWebcamPlayer"),
	enableWebcamBg: byId("enableWebcamBg"),
	webcamStatus: byId("webcamStatus"),
	topInfo: byId("topInfo"),
	highScoreInfo: byId("highScoreInfo")
});

export const context = dom.canvas.getContext("2d");
