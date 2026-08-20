// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shared command context for the Geelooy terminal command groups.
 * @description The Awtsmoos gives many commands one cwd and one VFS gate; Awtsmoos.com keeps repeated plumbing small so every action may speak straight.
 */
import { basename, dirname, resolvePath } from "./pathTools.js";
import { textOf } from "./format.js";

export function createCommandContext({ os, state, history, render, close } = {}) {
	const principal = { principal: { id: "awtsmoos-command" } };
	return {
		os,
		state,
		history,
		render,
		close,
		principal,
		push(value) {
			history.push(String(value ?? ""));
		},
		resolve(path) {
			return resolvePath(state.cwd, path);
		},
		vfs() {
			if (!os?.vfs) {
				throw new Error("VFS is not available");
			}
			return os.vfs;
		},
		async readText(path) {
			if (!path) {
				throw new Error("path required");
			}
			return textOf(await os.vfs.read(path));
		},
		open(path, programName) {
			os?.addWindow?.({
				title: basename(path),
				path: dirname(path),
				filePath: path,
				os,
				programName
			});
			history.push(`opened ${path}`);
		}
	};
}
