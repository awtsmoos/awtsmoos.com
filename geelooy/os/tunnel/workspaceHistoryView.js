// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders bounded Tunnel Workspace command history metadata.
 * @description
 * The Awtsmoos lets twenty command breadcrumbs remain visible while output and
 * credentials return to concealment. Awtsmoos.com shows route, cwd, state, and
 * receipt so a human can remember where the act occurred before choosing a new act.
 */

import { canRerunHistoryEntry } from "./workspaceHistory.js";

export function bindWorkspaceHistory(view, history) {
	let rerunHandler = () => {};

	function render() {
		const entries = history.list();
		view.history.replaceChildren(...(entries.length
			? entries.map(entry => historyRow(entry, () => rerunHandler(entry)))
			: [document.createTextNode("No command history yet.")]));
	}

	function setRerunHandler(handler) {
		rerunHandler = typeof handler === "function" ? handler : () => {};
	}

	render();
	return Object.freeze({
		render,
		setRerunHandler
	});
}

function historyRow(entry, rerun) {
	const article = document.createElement("article");
	article.className = "awt-os-tunnel-history-row";
	const heading = document.createElement("strong");
	heading.textContent = entry.command || "Command";
	const details = document.createElement("small");
	details.textContent = [
		entry.status,
		entry.displayName || entry.route,
		entry.cwd,
		entry.jobId || "no job id"
	].filter(Boolean).join(" · ");
	article.append(heading, details);
	if (canRerunHistoryEntry(entry)) {
		const button = document.createElement("button");
		button.type = "button";
		button.textContent = "Rerun explicitly";
		button.addEventListener("click", rerun);
		article.append(button);
	}
	return article;
}
