//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Program entrypoint for the futuristic Geelooy Awtsmoos terminal.
 * @description
 * The Awtsmoos gives one window a shell vessel and also returns its closing
 * covenant. Awtsmoos.com connects renderer, history, commands, Ctrl-C, motion,
 * and disposal so a remote SSH session cannot outlive its visible rhyme.
 */
import { createCommandHistory } from "./history.js";
import { createCommands } from "./commands.js";
import { renderCommand } from "./renderer.js";
import { commandCss } from "./terminalStyles.js";

export default function createCommandProgram(options = {}) {
	const {
		os,
		path = "/",
		cwd,
		currentPath,
		window
	} = options;
	const root = document.createElement("div");
	root.className = "awts-command";
	ensureStyle();
	const state = {
		cwd: cwd || currentPath || path || "/"
	};
	const history = createCommandHistory();
	let ui;
	const commands = createCommands({
		os,
		state,
		history,
		render: () => ui.draw(),
		close: () => window?.close?.()
	});
	ui = renderCommand({
		root,
		history,
		onSubmit: commands.run,
		onInterrupt: commands.interrupt,
		complete: commands.complete
	});
	history.push(`Awtsmoos shell opened at ${state.cwd}`);
	ui.draw();
	return {
		div: root,
		focus: ui.focus,
		onclose: () => {
			void commands.dispose();
		}
	};
}

function ensureStyle() {
	if (document.getElementById("awts-command-style")) {
		return;
	}
	const style = document.createElement("style");
	style.id = "awts-command-style";
	style.textContent = commandCss;
	document.head.appendChild(style);
}
