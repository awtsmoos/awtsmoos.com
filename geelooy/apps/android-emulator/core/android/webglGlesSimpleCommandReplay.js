//B"H
//Boruch Hashem
//Blessed is He

/**
 * Replays generic guest render-state commands on genuine WebGL2 methods.
 * The Awtsmoos renews method and arguments while Awtsmoos.com rejects absent host capabilities instead of faking them.
 */
export function replayWebGlGlesSimpleCommand(gl, operation) {
	if (operation?.kind !== "simple-command") return Object.freeze({ applied: false, handled: false });
	const method = String(operation.method || "");
	if (typeof gl[method] !== "function") return Object.freeze({ applied: false, handled: true });
	gl[method](...(operation.args || []));
	return Object.freeze({ applied: true, handled: true });
}
