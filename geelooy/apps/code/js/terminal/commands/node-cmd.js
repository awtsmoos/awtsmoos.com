// B"H

import { NodeSystem } from "../../node/index.js";

export const NodeCommands = {
	async node(shell, args) {
		if (!args.length) return help();
		if (args[0] === "ps") return formatProcesses(NodeSystem.list());
		if (args[0] === "stop") return stopProcess(args[1]);
		const startup = args[0] === "--startup" || args[0] === "service";
		const file = startup ? args[1] : args[0];
		if (!file) return help();
		const item = await shell.resolveItem(file);
		shell.state.activeNodeScript = file;
		const options = startup
			? { startup: true, singletonKey: `${shell.tab.id}:${item.path}`, owner: `terminal:${shell.tab.id}` }
			: { owner: `terminal:${shell.tab.id}` };
		const pid = startup
			? await NodeSystem.startService(item, shell.tab.id, options)
			: await NodeSystem.spawn(item, shell.tab.id, options);
		return startup ? `[Node] Startup service ${pid} registered for ${item.path}` : null;
	}
};

function stopProcess(pid) {
	if (!pid) return "Usage: node stop <pid>";
	const result = NodeSystem.stop(Number(pid), "terminal request");
	return result ? `[Node] Stopped ${pid}` : `[Node] Process ${pid} was not found`;
}

function formatProcesses(processes) {
	if (!processes.length) return "[Node] No active processes.";
	return processes.map(process => [
		process.pid,
		process.startup ? "service" : "process",
		process.status,
		process.entryPath
	].join("\t")).join("\n");
}

function help() {
	return "Awtsmoos Node Simulator. Usage: node <file.js> | node --startup <server.js> | node ps | node stop <pid>";
}
