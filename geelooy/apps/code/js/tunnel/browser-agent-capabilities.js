// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Capability names are the lightweight covenant between registration and
 * execution. The Awtsmoos renews name and implementation separately, while
 * Awtsmoos.com keeps this file free of browser-only dependencies so isolated
 * registration tests can import the contract without awakening the whole app.
 */
export const COMMAND_ACTIONS = Object.freeze([
	"command",
	"commandRun",
	"shellCommand",
	"run_terminal_command"
]);

export const FS_ACTIONS = new Set([
	"stat",
	"list",
	"tree",
	"read",
	"readLines",
	"readManyLines",
	"readBytes",
	"read64",
	"md",
	"bulk",
	"grep",
	"findFiles",
	"fileHashes",
	"write",
	"bulkWrite",
	"writeIfHash",
	"bulkWriteIfHashes",
	"findReplace",
	"replaceRange",
	"applyPatch",
	"mkdirp",
	"ensureFile",
	"touch",
	"deleteFile",
	"deleteTree",
	"emptyDir",
	"rg",
	"selectString",
	"selectStringFile",
	"symbolOutline",
	"connectedFiles"
]);

export const BROWSER_PREVIEW_ACTIONS = Object.freeze([
	"chromeNavigate",
	"chromeClick",
	"chromeType",
	"chromeFind",
	"chromeWaitForSelector",
	"chromeSnapshot",
	"chromeEval",
	"chromeStatus",
	"chromeTargetSelector",
	"navigate",
	"reload",
	"hardReset",
	"hardTeset",
	"waitForSelector",
	"query",
	"queryAll",
	"click",
	"type",
	"eval",
	"runScript",
	"snapshot",
	"consoleLogs",
	"storageGet",
	"storageSet",
	"storageClear"
]);

export const ALL_BROWSER_TUNNEL_ACTIONS = Object.freeze([
	...new Set([
		...FS_ACTIONS,
		...COMMAND_ACTIONS,
		...BROWSER_PREVIEW_ACTIONS
	])
]);
