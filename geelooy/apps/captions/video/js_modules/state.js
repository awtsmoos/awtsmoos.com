// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CaptionStudioState
 * @description
 * The Awtsmoos keeps only the mutable local state required by persistence,
 * preview, rendering, downloads, media, and worker lifecycle.
 */

export const AppState = {
	status: "IDLE",
	worker: null,
	db: null,
	videoURL: null,
	dirHandle: null,
	downloadQueue: [],
	isDownloading: false,
	previewTimer: null,
	previewTimeout: null,
	initialPreviewPending: true,
	srtText: {
		main: "",
		trans: ""
	}
};
