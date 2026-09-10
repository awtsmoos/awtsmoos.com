//B"H
//Boruch Hashem
//Blessed be He

const { instructionPack } = require("./pack.js");

/**
 * @file Turns the user's execution covenant into small lazily fetched instruction chapters.
 * @description
 * Speed, proof, resource restraint, readable source, and native construction remain distinct
 * obligations so a Shliach can request deeper law without receiving one enormous prompt.
 */
const executionDoctrine = Object.freeze([
	instructionPack({
		id: "execution.lightning-throughput",
		summary: "Move at extreme speed by keeping useful independent work moving instead of waiting serially.",
		tags: ["mission", "execution", "speed"],
		instructions: [
			"Work as quickly as correctness permits; remove idle time, redundant scans, and unnecessary serialization.",
			"When one useful lane waits on I/O, a test, browser, network, or child process, advance another independent ready lane immediately.",
			"Batch independent reads, checks, and observations while preserving deterministic mutation order."
		]
	}),
	instructionPack({
		id: "execution.seven-ready-lanes",
		summary: "Maintain up to seven useful independent ready lanes when machine pressure and dependency safety permit.",
		tags: ["mission", "execution", "parallel"],
		instructions: [
			"Aim for as many as seven useful independent lanes when there is real ready work and sufficient host capacity.",
			"If one of those lanes blocks, pull another independent ready item instead of idling the whole mission.",
			"Never invent filler, duplicate work, overlapping file writes, or extra browser trees merely to reach a numeric target."
		]
	}),
	instructionPack({
		id: "execution.accuracy-proof",
		summary: "Concurrency may remove waiting but never remove inspection, accuracy, verification, or truthful completion evidence.",
		tags: ["mission", "execution", "verify"],
		instructions: [
			"Fast work still requires current-file inspection, real output checks, failure-path verification, and evidence-backed claims.",
			"Never convert a timeout, queued action, successful source write, or optimistic status into completion without the required proof.",
			"Prefer several independent verification lanes over skipping verification."
		]
	}),
	instructionPack({
		id: "execution.control-plane-reserve",
		summary: "Protect Tunnel, health, cancellation, recovery, and operator capacity before optional parallel work.",
		tags: ["mission", "execution", "stability"],
		instructions: [
			"Control and recovery lanes outrank background analysis, browser audits, screenshots, and optional fan-out.",
			"Reduce optional concurrency before CPU, memory, event-loop lag, or browser pressure can disconnect the Tunnel or remote control.",
			"A self-healing mechanism must not consume the resources needed to observe or repair its own failure."
		]
	}),
	instructionPack({
		id: "execution.serialize-conflicts",
		summary: "Parallelize independent work aggressively while serializing shared mutation authority and overlapping writes.",
		tags: ["mission", "execution", "write"],
		instructions: [
			"Never concurrently mutate the same file, Git index, deployment authority, mission lease, browser Send lane, or shared runtime generation.",
			"Use explicit claims, stable keys, and fenced ownership where concurrent agents could collide.",
			"Parallelism belongs around independent work; correctness-sensitive ordering remains serialized."
		]
	}),
	instructionPack({
		id: "execution.full-completion",
		summary: "Carry requested work through implementation, verification, runtime proof, and release closure instead of stopping halfway.",
		tags: ["mission", "execution", "completion"],
		instructions: [
			"Do not stop at brainstorming, source edits, unit tests, or packaging when the user's requested outcome requires later stages.",
			"Compare planned versus actual work, register anything still missing, and continue until the applicable completion gate is satisfied.",
			"If a task cannot finish now, preserve exact durable remaining work so another session can continue without guesswork."
		]
	}),
	instructionPack({
		id: "code.exact-source-law",
		summary: "Every touched JavaScript file uses the exact B\"H header, tabs, extensive useful JSDoc, readable spacing, and at most 120 lines.",
		tags: ["mission", "code", "javascript"],
		applies: { extensions: [".js", ".cjs", ".mjs", ".jsx"] },
		instructions: [
			"Start every touched JavaScript file with //B\"H, //Boruch Hashem, and //Blessed be He on separate lines.",
			"Use tab indentation, descriptive names, extensive useful JSDoc, proper newlines, and generous readable spacing.",
			"Keep every touched JavaScript file at or below 120 physical lines by splitting real responsibilities into smaller modules.",
			"Never minify, collapse statements, compress functions, or sacrifice documentation merely to satisfy the line limit."
		]
	}),
	instructionPack({
		id: "code.native-no-external-libraries",
		summary: "Build new functionality from native JavaScript, Node built-ins, browser APIs, and project-owned code without external libraries.",
		tags: ["mission", "code", "native"],
		applies: { taskHints: ["javascript", "node", "backend", "frontend", "tunnel", "agent"] },
		instructions: [
			"Do not add npm packages, third-party runtime libraries, CDN dependencies, framework plugins, or hidden package-level shortcuts.",
			"Prefer native JavaScript, Node built-in modules, browser/web-platform APIs, operating-system primitives, and small project-owned modules.",
			"When existing unrelated code already depends on third-party packages, do not expand that dependency surface; new implementation remains native unless the user explicitly changes this covenant.",
			"Implement missing primitives from scratch when practical, with tests that prove the project-owned behavior."
		]
	})
]);

module.exports = { executionDoctrine };
