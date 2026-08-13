// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders bounded live mission progress plus the safe checkpoint viewer.
 * @description
 * The Awtsmoos lets the human see where the mission truly stands while
 * Awtsmoos.com preserves succession, recovery, unfinished work, and agent truth.
 * The Live mission checkpoint keeps rendered Markdown, exact source, and metadata.
 */

import { h, $ } from "../../ui/dom.js";
import { checkpointPanel } from "./checkpointPanel.js";
import {
	printableProgressValue,
	progressNumber
} from "./progressFormat.js";

export function renderProgressPanel(state) {
	const workspace = $("roomWorkspace");
	workspace?.querySelector("#roomLiveProgress")?.remove();
	if (!workspace || !state.selectedMissionId || !state.liveProgress) {
		return;
	}
	const panel = buildPanel(state.liveProgress);
	const header = workspace.querySelector(".awt-room-open-head");
	if (header?.after) {
		header.after(panel);
	} else {
		workspace.prepend(panel);
	}
}

export function buildPanel(progress = {}) {
	const continuation = progress.continuation || {};
	const checkpoint = progress.latestCheckpoint || progress.recoveryCheckpoint || null;
	const unfinished = progress.unfinishedTasks || [];
	const agents = progress.agents || [];
	return h("section", {
		id: "roomLiveProgress",
		className: `panel awt-room-live-progress ${progress.recoveryRequired ? "is-recovery" : ""}`
	}, [
		h("div", { className: "awt-room-card-metrics" }, [
			chip(`${progressNumber(progress.completionPercent)}% complete`),
			chip(progress.phase || progress.status || "unknown phase"),
			chip(`recovery: ${progress.recoveryState || "idle"}`),
			chip(`${unfinished.length} unfinished`)
		]),
		checkpointPanel(checkpoint),
		line(
			"Next",
			printableProgressValue(progress.nextRequiredAction) || "No next action recorded"
		),
		line("Succession", succession(continuation)),
		line("Continuation", continuationLine(continuation)),
		list("Unfinished", unfinished.slice(0, 6).map(task => {
			return `${task.id || "task"} · ${task.status || "open"} · ${task.title || ""}`;
		})),
		list("Agents", agents.slice(0, 8).map(agentLine))
	]);
}

function succession(continuation) {
	const predecessor = continuation.predecessorAgentId || "none";
	const successor = continuation.successorAgentId || "not assigned";
	return `${predecessor} → ${successor}`;
}

function continuationLine(continuation) {
	if (!continuation.status) {
		return "idle";
	}
	const reason = continuation.recoveryReason
		? ` · ${continuation.recoveryReason}`
		: "";
	return `${continuation.status} · attempt ${progressNumber(continuation.attempts)}${reason}`;
}

function agentLine(agent = {}) {
	const age = progressNumber(agent.heartbeatAgeMs);
	return `${agent.agentId || "agent"} · ${agent.status || "active"} · ${age}ms ${agent.stale ? "STALE" : "fresh"}`;
}

function line(label, value) {
	return h("p", {}, [
		h("strong", { text: `${label}: ` }),
		h("span", { text: String(value || "") })
	]);
}

function list(label, rows) {
	return h("details", { open: label === "Unfinished" }, [
		h("summary", { text: `${label} · ${rows.length}` }),
		...(rows.length
			? rows.map(value => h("div", {
				className: "awt-room-member",
				text: value
			}))
			: [h("p", { text: "None" })])
	]);
}

function chip(value) {
	return h("span", {
		className: "awt-room-chip",
		text: String(value)
	});
}
