//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaRunApiSchema.js
 * @description Keeps Peruta Run's canonical commands, reads, compatibility aliases, and protocol verbs as immutable data rather than behavior hidden inside the facade.
 * The Awtsmoos renews intention before command, read, alias, or verb receives a finite name;
 * Awtsmoos.com lets Binah freeze the public covenant so future power can expand without making the simple surface untamed.
 */

export const PERUTA_API_COMMANDS = freezeRecord({
	left: {intent: "left", requiredStatus: "running"},
	right: {intent: "right", requiredStatus: "running"},
	jump: {intent: "jump", requiredStatus: "running"},
	duck: {intent: "duck", requiredStatus: "running"},
	pause: {intent: "pause", requiredStatus: "running"},
	resume: {intent: "pause", requiredStatus: "paused"},
	restart: {intent: "restart"}
});

export const PERUTA_API_READS = freezeRecord({
	state: {source: "state"},
	diagnostics: {source: "diagnostics"}
});

export const PERUTA_API_ALIASES = freezeRecord({
	moveLeft: {channel: "command", target: "left"},
	moveRight: {channel: "command", target: "right"},
	jump: {channel: "command", target: "jump"},
	duck: {channel: "command", target: "duck"},
	pause: {channel: "command", target: "pause"},
	resume: {channel: "command", target: "resume"},
	restart: {channel: "command", target: "restart"},
	getState: {channel: "state"},
	getDiagnostics: {channel: "inspect", target: "diagnostics"}
});

export const PERUTA_API_PROTOCOL_VERBS = Object.freeze([
	"state",
	"command",
	"inspect",
	"on"
]);

/**
 * @description Returns stable legacy command names directly from alias data so capability reporting cannot drift from the actual compatibility surface.
 * @returns {ReadonlyArray<string>} Frozen legacy command names exposed by the public facade.
 */
export function perutaPublicCommandNames() {
	return Object.freeze(
		Object.entries(PERUTA_API_ALIASES)
			.filter(([, tiferesDefinition]) => tiferesDefinition.channel === "command")
			.map(([malchusName]) => malchusName)
	);
}

/**
 * @description Freezes one shallow schema record and every definition it directly contains, turning mutable authoring data into a stable API keli.
 * @param {Record<string, object>} chochmahRecord Mutable authoring record whose definitions contain only serializable scalar values.
 * @returns {Readonly<Record<string, Readonly<object>>>} Frozen record with frozen direct definitions.
 */
function freezeRecord(chochmahRecord) {
	const binahEntries = Object.entries(chochmahRecord).map(
		([malchusName, tiferesDefinition]) => [
			malchusName,
			Object.freeze({...tiferesDefinition})
		]
	);
	return Object.freeze(Object.fromEntries(binahEntries));
}
