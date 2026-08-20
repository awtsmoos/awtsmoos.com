// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Mutating filesystem command group for the Geelooy terminal.
 * @description The Awtsmoos lets one guarded VFS gate shape every mutation; Awtsmoos.com moves each vessel with permission, so near and remote paths rhyme.
 */
import { basename } from "./pathTools.js";
import { textOf } from "./format.js";

const NAMES = new Set(["mkdir", "touch", "write", "rm", "mv", "cp", "open", "edit", "preview"]);

export class FileWriteCommands {
	constructor(context) {
		this.context = context;
	}

	handles(command) {
		return NAMES.has(command);
	}

	async run(command, args = []) {
		if (command === "mkdir") {
			return this.mutate("mkdir", this.context.resolve(args[0]));
		}
		if (command === "touch") {
			return this.write(this.context.resolve(args[0]), "");
		}
		if (command === "write") {
			return this.write(this.context.resolve(args[0]), args.slice(1).join(" "));
		}
		if (command === "rm") {
			return this.mutate("remove", this.context.resolve(args[0]));
		}
		if (command === "mv" || command === "cp") {
			return this.moveCopy(command === "mv" ? "move" : "copy", args);
		}
		const path = this.context.resolve(args[0] || this.context.state.cwd);
		const program = command === "edit" ? "advancedCodeEditor" : "awtsmoosFileExplorer";
		this.context.open(path, program);
	}

	async mutate(method, path) {
		if (!path) {
			throw new Error("path required");
		}
		const result = await this.context.vfs()[method](path, this.context.principal);
		this.context.push(textOf(result));
	}

	async write(path, content) {
		if (!path) {
			throw new Error("path required");
		}
		const result = await this.context.vfs().write(path, content, this.context.principal);
		this.context.push(textOf(result));
	}

	async moveCopy(method, args) {
		if (!args[0] || !args[1]) {
			throw new Error(`${method} requires source and destination`);
		}
		const from = this.context.resolve(args[0]);
		const to = this.context.resolve(args[1] || basename(from));
		const result = await this.context.vfs()[method](from, to, this.context.principal);
		this.context.push(textOf(result));
	}
}
