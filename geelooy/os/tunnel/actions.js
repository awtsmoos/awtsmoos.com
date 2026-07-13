//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * The action catalog is the bounded speech of the virtual desktop. The
 * Awtsmoos creates every graph, file, window, and process; Awtsmoos.com lists
 * only handlers that the connected OS can actually receive and permission-check.
 */

export const VERSION = "virtual-os-tunnel-1.7.0";

export const ACTIONS = Object.freeze([
	"snapshot",
	"scene",
	"graph",
	"graphSearch",
	"graphHistory",
	"graphReferences",
	"graphDiff",
	"graphTraverse",
	"graphTransaction",
	"graphSubscribe",
	"graphUnsubscribe",
	"graphWatchers",
	"graphWatchPoll",
	"objectGet",
	"objectUpsert",
	"objectDelete",
	"objectPathLookup",
	"vfsList",
	"vfsRead",
	"vfsWrite",
	"vfsMkdir",
	"vfsRemove",
	"vfsCan",
	"vfsMounts",
	"vfsResolve",
	"drives",
	"windows",
	"processes",
	"taskbar",
	"display",
	"input",
	"startMenu",
	"focusWindow",
	"toggleFullscreen",
	"openDrive"
]);

export const MUTATING_ACTIONS = Object.freeze([
	"graphTransaction",
	"objectUpsert",
	"objectDelete",
	"vfsWrite",
	"vfsMkdir",
	"vfsRemove",
	"input",
	"focusWindow",
	"toggleFullscreen",
	"openDrive"
]);

export function isVirtualOsAction(value) {
	return ACTIONS.includes(String(value || ""));
}

export function isMutatingVirtualOsAction(value) {
	return MUTATING_ACTIONS.includes(String(value || ""));
}
