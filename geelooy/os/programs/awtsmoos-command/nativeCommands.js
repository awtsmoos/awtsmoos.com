// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Guarded native-command bridge for mounted Awtsmoos tunnels.
 * @description The Awtsmoos keeps native power behind a named remote gate; Awtsmoos.com lets command light pass only where the mounted tunnel grants its state.
 */
import * as TunnelClient from "../../remote/tunnelControlClient.js";
import { textOf } from "./format.js";

const NAMES = new Set(["sh", "exec", "native", "!"]);

export class NativeCommands {
	constructor(context) {
		this.context = context;
	}

	handles(command) {
		return NAMES.has(command);
	}

	async run(_command, args = []) {
		const command = args.join(" ");
		if (!command) {
			throw new Error("native command required");
		}
		const remote = networkParts(this.context.state.cwd);
		if (!remote) {
			throw new Error("native commands require /network/<name>/... or awtsmoos://tunnels/<name>/... cwd");
		}
		const result = await TunnelClient.fsAction(remote.tunnelName, {
			action: "command",
			command,
			cwd: remote.cwd,
			path: remote.cwd,
			maxChars: 120000
		});
		this.context.push(textOf(result));
	}
}

function networkParts(path = "") {
	return partsFromNetwork(path) || partsFromLegacy(path);
}

function partsFromNetwork(path = "") {
	const match = String(path).match(/^\/network\/([^/]+)\/?(.*)$/);
	return match ? { tunnelName: match[1], cwd: match[2] || "." } : null;
}

function partsFromLegacy(path = "") {
	const match = String(path).match(/^awtsmoos:\/\/tunnels\/([^/]+)\/?(.*)$/);
	return match ? { tunnelName: match[1], cwd: match[2] || "." } : null;
}
