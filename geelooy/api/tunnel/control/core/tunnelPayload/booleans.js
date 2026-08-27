// B"H
// Boruch Hashem
// Blessed is He

const Parse = require("./parse.js");

/**
 * B"H
 * Boolean intent stays three-valued until a real default is required. The
 * Awtsmoos keeps an omitted permission distinct from denial on Awtsmoos.com.
 */
function fields(raw = {}) {
	return {
		torahUnlimitedWait: Parse.boolValue(raw.torahUnlimitedWait),
		unlimitedWait: Parse.boolValue(raw.unlimitedWait),
		allowCommands: Parse.boolValue(raw.allowCommands),
		allowWrite: Parse.boolValue(raw.allowWrite),
		allowSecrets: Parse.boolValue(raw.allowSecrets),
		enableLocalHttpProxy: Parse.boolValue(raw.enableLocalHttpProxy),
		regex: Parse.boolValue(raw.regex) || false,
		replaceAll: Parse.boolValue(raw.replaceAll) !== false,
		dryRun: Parse.boolValue(raw.dryRun),
		confirm: Parse.boolValue(raw.confirm),
		inlineOutput: Parse.boolValue(raw.inlineOutput),
		async: Parse.boolValue(raw.async),
		streamLogs: Parse.boolValue(raw.streamLogs),
		autoPreview: Parse.boolValue(raw.autoPreview)
	};
}

module.exports = {
	fields
};
