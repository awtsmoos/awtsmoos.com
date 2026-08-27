// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Manual durable-command bindings plus bounded history testimony.
 * @description
 * The Awtsmoos gives one human command one remote receipt and one local breadcrumb.
 * Awtsmoos.com follows the receipt without replay, stores no output, and permits a
 * rerun only when the same immutable route is still selected and the old act is done.
 */

import {
	cancelRemoteCommand,
	followRemoteCommand,
	startRemoteCommand
} from "./remoteCommand.js";
import { extractCommandOutput } from "./workspaceData.js";
import { canRerunHistoryEntry } from "./workspaceHistory.js";

export function bindWorkspaceCommands(view, mount, options = {}) {
	let currentJobId = "";
	let currentHistoryId = "";
	const history = options.history;

	async function run(commandOverride = "") {
		const target = mount.getTarget();
		const command = String(commandOverride || view.command.value || "").trim();
		if (!command || !target?.canCommand) {
			setStatus(view, "Choose a command-capable tunnel and enter a command.", true);
			return;
		}
		const startedAt = Date.now();
		currentHistoryId = `command-${startedAt}`;
		record({
			id: currentHistoryId,
			command,
			cwd: mount.getState().cwd,
			route: target.route,
			displayName: target.name || target.displayName,
			status: "dispatching",
			startedAt
		});
		setStatus(view, "Dispatching one durable command…");
		try {
			const receipt = await startRemoteCommand(
				target,
				command,
				mount.getState().cwd,
				options.fetcher
			);
			currentJobId = receipt.jobId;
			view.cancelButton.disabled = !currentJobId;
			record({ id: currentHistoryId, jobId: currentJobId, status: receipt.status });
			const final = await followRemoteCommand(target, receipt, {
				fetcher: options.fetcher,
				onUpdate(update) {
					record({ id: currentHistoryId, jobId: update.jobId, status: update.status });
					setStatus(view, `${update.status} · ${update.jobId || "accepted without job id"}`);
				}
			});
			view.output.textContent = extractCommandOutput(final);
			record({
				id: currentHistoryId,
				jobId: final.jobId,
				status: final.status || "completed",
				finishedAt: Date.now()
			});
			setStatus(view, final.status || "Complete");
		} catch (error) {
			record({ id: currentHistoryId, status: "failed", finishedAt: Date.now() });
			setStatus(view, error.message, true);
		} finally {
			currentJobId = "";
			currentHistoryId = "";
			view.cancelButton.disabled = true;
		}
	}

	async function cancel() {
		if (!currentJobId) return;
		try {
			await cancelRemoteCommand(mount.getTarget(), currentJobId, options.fetcher);
			record({ id: currentHistoryId, jobId: currentJobId, status: "cancel_requested" });
			setStatus(view, `Cancellation requested for ${currentJobId}.`);
		} catch (error) {
			setStatus(view, error.message, true);
		}
	}

	async function rerun(entry) {
		const target = mount.getTarget();
		if (!canRerunHistoryEntry(entry) || target?.route !== entry.route) {
			setStatus(view, "Rerun requires the same currently mounted immutable route.", true);
			return;
		}
		view.command.value = entry.command;
		await run(entry.command);
	}

	function record(update) {
		if (!history || !currentHistoryId) return;
		const previous = history.list().find(entry => entry.id === currentHistoryId) || {};
		history.record({ ...previous, ...update });
		options.onHistoryChange?.();
	}

	view.runButton.addEventListener("click", () => run());
	view.cancelButton.addEventListener("click", cancel);
	view.panel.addEventListener("awtsmoos:tunnel-target", () => {
		view.runButton.disabled = !mount.getTarget()?.canCommand;
	});
	return Object.freeze({ getCurrentJobId: () => currentJobId, run, rerun, cancel });
}

function setStatus(view, text, error = false) {
	view.commandStatus.textContent = text;
	view.commandStatus.dataset.state = error ? "error" : "ok";
}
