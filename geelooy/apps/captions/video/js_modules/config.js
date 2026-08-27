// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CaptionStudioConfig
 * @description
 * The Awtsmoos names every stable caption-studio doorway once so rendering,
 * storage, dialogs, preview, and progress share one truthful DOM contract.
 */

function getElement(id) {
	const element = document.getElementById(id);
	if (!element) {
		console.warn(`Missing caption studio element: #${id}`);
	}
	return element;
}

export const DOM = {
	appContainer: document.querySelector(".app-container"),
	controlsWrapper: getElement("controls-wrapper"),
	controlsDiv: getElement("controls"),
	previewWrapper: getElement("preview-wrapper"),
	previewContainer: getElement("preview-container"),
	renderOverlay: getElement("render-overlay"),
	renderMode: getElement("renderMode"),
	frameRate: getElement("frameRate"),
	videoWidth: getElement("videoWidth"),
	videoHeight: getElement("videoHeight"),
	headerText: getElement("headerText"),
	captionSource: getElement("captionSource"),
	captionDuration: getElement("captionDuration"),
	mainCaptions: getElement("mainCaptions"),
	translationCaptions: getElement("translationCaptions"),
	translationCaptionField: getElement("translation-caption-field"),
	dualCaptionToggle: getElement("dualCaptionToggle"),
	dualCaptionContainer: getElement("dual-caption-toggle-container"),
	srtFile: getElement("srtFile"),
	translationSrtFile: getElement("translationSrtFile"),
	audioFile: getElement("audioFile"),
	backgroundImageInput: getElement("backgroundImageInput"),
	portalImagesInput: getElement("portalImages"),
	dynamicBackgroundToggle: getElement("dynamicBackgroundToggle"),
	enableImageDownload: getElement("enableImageDownload"),
	folderControls: getElement("image-download-folder-controls"),
	selectDownloadFolderButton: getElement("selectDownloadFolderButton"),
	folderDisplay: getElement("selectedDownloadFolderDisplay"),
	renderButton: getElement("renderButton"),
	previewButton: getElement("previewButton"),
	cancelButton: getElement("cancelButton"),
	savePresetBtn: getElement("save-preset-btn"),
	deletePresetBtn: getElement("delete-preset-btn"),
	presetSelect: getElement("preset-select"),
	randomizeAllBtn: getElement("randomize-all-btn"),
	mobileCloseBtn: getElement("mobile-close-btn"),
	previewCanvas: getElement("previewCanvas"),
	outputVideo: getElement("outputVideo"),
	status: getElement("status"),
	progressBar: getElement("progressBar"),
	progressContainer: getElement("progressContainer"),
	simpleControls: getElement("simple-caption-controls"),
	srtControls: getElement("srt-caption-controls"),
	presetDialog: getElement("preset-dialog"),
	presetDialogTitle: getElement("preset-dialog-title"),
	presetDialogCopy: getElement("preset-dialog-copy"),
	presetDialogError: getElement("preset-dialog-error"),
	presetDialogConfirm: getElement("preset-dialog-confirm"),
	presetName: getElement("preset-name"),
	presetNameField: getElement("preset-name-field")
};

export const CTX = DOM.previewCanvas
	? DOM.previewCanvas.getContext("2d")
	: null;
