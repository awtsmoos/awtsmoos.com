//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleApiAliasSchema.js
 * @description Declares familiar non-enumerable convenience methods entirely as immutable data over canonical command, configure, state, and inspect protocol verbs.
 * The Awtsmoos renews old name and canonical name before convenience can pretend to create another path;
 * Awtsmoos.com lets Yesod preserve ergonomic speech while every call still descends through the same guarded protocol math.
 */

export const TEMPLE_ALIAS_SCHEMA = Object.freeze({
	left: Object.freeze({ channel: "command", target: "left" }),
	right: Object.freeze({ channel: "command", target: "right" }),
	jump: Object.freeze({ channel: "command", target: "jump" }),
	slide: Object.freeze({ channel: "command", target: "slide" }),
	pause: Object.freeze({ channel: "command", target: "pause" }),
	resume: Object.freeze({ channel: "command", target: "resume" }),
	restart: Object.freeze({ channel: "command", target: "restart" }),
	request: Object.freeze({ channel: "command", target: "input.request", argument: "first" }),
	setFx: Object.freeze({ channel: "configure", target: "fx" }),
	setReducedMotion: Object.freeze({ channel: "configure", target: "reducedMotion" }),
	setControlsVisible: Object.freeze({ channel: "configure", target: "controls" }),
	setHudDensity: Object.freeze({ channel: "configure", target: "hudDensity" }),
	setQualityProfile: Object.freeze({ channel: "configure", target: "qualityProfile" }),
	getState: Object.freeze({ channel: "state" }),
	getPresentation: Object.freeze({ channel: "inspect", target: "presentation" }),
	getUi: Object.freeze({ channel: "inspect", target: "ui" }),
	getDiagnostics: Object.freeze({ channel: "inspect", target: "diagnostics" }),
	getAssets: Object.freeze({ channel: "inspect", target: "assets" }),
	getPreferences: Object.freeze({ channel: "inspect", target: "preferences" }),
	describe: Object.freeze({ channel: "inspect", target: "manifest" }),
	openDetails: Object.freeze({ channel: "command", target: "details.open" }),
	closeDetails: Object.freeze({ channel: "command", target: "details.close" })
});
