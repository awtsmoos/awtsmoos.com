//B"H
//Boruch Hashem
//Blessed be He

const { instructionPack } = require("./pack.js");

/**
 * @file Defines the Tunnel's no-idle execution conveyor for fast autonomous work.
 * @description
 * The Awtsmoos keeps useful independent deeds moving while one deed waits.
 * Awtsmoos.com separates logical concurrency from scarce browser and mutation authority.
 */
const executionMomentumInstructions = Object.freeze([
	instructionPack({
		id: "execution.ready-work-conveyor",
		summary: "Never wait idly while independent safe ready work exists; pull another useful node immediately.",
		tags: ["mission", "execution", "parallel", "waiting"],
		applies: { taskHints: ["wait", "slow", "parallel", "multitask", "lightning"] },
		instructions: [
			"Maintain READY, RUNNING, WAITING, BLOCKED, and DONE work sets instead of treating one blocked operation as the whole mission.",
			"When RUNNING work enters I/O or an external wait, immediately pull the highest-value independent READY node that fits the current resource budget.",
			"Useful waiting-time work includes bounded inspection, tests, docs, evidence capture, dependency mapping, and preparation of non-conflicting next work.",
			"Never spin, poll aggressively, duplicate investigation, or create meaningless work merely to avoid the appearance of waiting."
		]
	}),
	instructionPack({
		id: "execution.resource-aware-seven",
		summary: "Use up to seven logical lanes while keeping scarce physical resources intentionally singular and bounded.",
		tags: ["mission", "execution", "parallel", "stability"],
		applies: { taskHints: ["parallel", "seven", "concurrent", "agent", "browser"] },
		instructions: [
			"Seven is a ceiling for useful independent logical lanes, not a command to spawn seven processes, browsers, or writers.",
			"Keep Shared AI Chrome to one profile and one root; keep physical ChatGPT Send to one disposable turn at a time even while other logical work proceeds.",
			"Reduce concurrency automatically under CPU, memory, event-loop, browser, websocket, or remote-control pressure and refill only after capacity returns.",
			"Reserve capacity for Tunnel control, cancellation, status, recovery, and operator access before optional background work."
		]
	}),
	instructionPack({
		id: "execution.no-report-substitution",
		summary: "Do useful work before emitting a progress report whenever a safe next action is already known.",
		tags: ["mission", "execution", "continuation"],
		applies: { taskHints: ["progress", "status", "continue", "work"] },
		instructions: [
			"Do not stop merely because enough information exists to write a progress report; execute the next safe known action first.",
			"Use progress reporting to expose meaningful milestones, blockers, evidence, or operator decisions without substituting narration for execution.",
			"If a tool lane is waiting, continue independent safe work before reporting that the mission is waiting.",
			"Never claim background work will happen later unless a real scheduler or durable automation actually owns it."
		]
	}),
	instructionPack({
		id: "execution.value-priority",
		summary: "Choose parallel work by risk reduction, knowledge gain, dependency unlocking, verification, user value, and maintainability.",
		tags: ["mission", "execution", "priority"],
		applies: { taskHints: ["priority", "next", "parallel", "plan"] },
		instructions: [
			"When several independent nodes are ready, prefer work that reduces risk, generates decisive knowledge, unlocks dependencies, proves behavior, or directly advances user value.",
			"Do not let convenient low-value cleanup starve a difficult node with greater mission gravity.",
			"Use short probes to retire uncertainty early, then shift capacity toward implementation and verification rather than endless exploration.",
			"Recompute priority after new evidence because the best next action may change when a blocker or dependency is revealed."
		]
	})
]);

module.exports = { executionMomentumInstructions };
