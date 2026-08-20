// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Read-only filesystem command group for the Geelooy terminal.
 * @description The Awtsmoos lets each provider be read through one VFS light; Awtsmoos.com shows near and far files without teaching the shell their hidden machinery.
 */
import { basename } from "./pathTools.js";
import { table, textOf } from "./format.js";

const NAMES = new Set(["pwd", "cd", "ls", "ll", "tree", "cat", "read", "head", "tail", "grep", "find", "search", "stat", "json"]);

export class FileReadCommands {
	constructor(context) {
		this.context = context;
	}

	handles(command) {
		return NAMES.has(command);
	}

	async run(command, args = []) {
		if (command === "pwd") {
			this.context.push(this.context.state.cwd);
			return;
		}
		if (command === "cd") {
			return this.cd(args[0] || "/");
		}
		if (command === "ls" || command === "ll") {
			return this.list(args[0], command === "ll");
		}
		if (command === "tree") {
			const path = this.context.resolve(args[0] || this.context.state.cwd);
			this.context.push(await this.tree(path, Number(args[1] || 2)));
			return;
		}
		if (command === "cat" || command === "read") {
			this.context.push(await this.context.readText(this.context.resolve(args[0])));
			return;
		}
		if (command === "head" || command === "tail") {
			return this.slice(command, args);
		}
		if (command === "grep") {
			return this.grep(args[0], this.context.resolve(args[1] || this.context.state.cwd));
		}
		if (command === "find" || command === "search") {
			return this.find(this.context.resolve(args[0] || this.context.state.cwd), args.slice(1).join(" "));
		}
		if (command === "stat") {
			this.context.push(textOf(await this.context.vfs().stat(this.context.resolve(args[0] || this.context.state.cwd))));
			return;
		}
		if (command === "json") {
			const text = await this.context.readText(this.context.resolve(args[0]));
			this.context.push(JSON.stringify(JSON.parse(text), null, 2));
		}
	}

	async cd(path) {
		const next = this.context.resolve(path);
		await this.context.vfs().list(next);
		this.context.state.cwd = next;
		this.context.push(next);
	}

	async list(path, long = false) {
		const target = this.context.resolve(path || this.context.state.cwd);
		this.context.push(table(await this.context.vfs().list(target), long));
	}

	async slice(command, args) {
		const lines = (await this.context.readText(this.context.resolve(args[0]))).split("\n");
		const count = Number(args[1] || 10);
		this.context.push(command === "head" ? lines.slice(0, count).join("\n") : lines.slice(-count).join("\n"));
	}

	async grep(pattern, path) {
		if (!pattern) {
			throw new Error("pattern required");
		}
		const lines = (await this.context.readText(path)).split("\n");
		this.context.push(lines.filter(line => line.includes(pattern)).join("\n") || "(no matches)");
	}

	async find(path, query) {
		const rows = await this.context.vfs().list(path);
		const needle = String(query || "").toLowerCase();
		const matches = rows.filter(item => !needle || String(item.name || item.path || "").toLowerCase().includes(needle));
		this.context.push(matches.map(item => `${item.type || item.kind || "item"} ${item.name || item.path}`).join("\n") || "(no matches)");
	}

	async tree(path, depth, prefix = "") {
		const rows = await this.context.vfs().list(path);
		const output = [];
		for (const item of rows) {
			const name = item.name || basename(item.path);
			output.push(`${prefix}${name}`);
			if (depth > 1 && /folder|directory/.test(item.type || item.kind || "")) {
				output.push(await this.tree(this.context.resolve(`${path}/${name}`), depth - 1, `${prefix}\t`));
			}
		}
		return output.filter(Boolean).join("\n") || "(empty)";
	}
}
