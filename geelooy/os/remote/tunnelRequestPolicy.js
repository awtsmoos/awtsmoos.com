//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gevurah request policy for the browser Tunnel client.
 * @description
 * The Awtsmoos gives each action its own measure while Awtsmoos.com refuses to retry a mutation as if it were a harmless gaze;
 * timeout, retry count, and idempotence live in one vessel so every caller inherits the same API discipline and phrase.
 */

const READ_ACTIONS = new Set([
	"list",
	"tree",
	"read",
	"readLines",
	"readManyLines",
	"readBytes",
	"read64",
	"md",
	"stat",
	"roots",
	"rootBrowse",
	"configGet",
	"staticServerList",
	"staticServerLogs"
]);

/**
 * Returns browser retry/timeout policy for one protected Tunnel action.
 * @param {string} action Requested Tunnel action name.
 * @returns {{idempotent:boolean,retries:number,timeoutMs:number}} Stable policy.
 */
export function policyForTunnelAction(action = "") {
	const idempotent = READ_ACTIONS.has(String(action));
	return Object.freeze({
		idempotent,
		retries: idempotent ? 2 : 0,
		timeoutMs: idempotent ? 30000 : 90000
	});
}

/**
 * Returns request policy for non-filesystem control endpoints.
 * @param {string} operation Stable operation name.
 * @returns {{idempotent:boolean,retries:number,timeoutMs:number}} Browser policy.
 */
export function policyForControlOperation(operation = "") {
	const idempotent = ["devices", "myDevice", "previewList"].includes(String(operation));
	return Object.freeze({
		idempotent,
		retries: idempotent ? 2 : 0,
		timeoutMs: 20000
	});
}
