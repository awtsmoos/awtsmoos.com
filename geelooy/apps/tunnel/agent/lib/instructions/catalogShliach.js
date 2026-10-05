//B"H
//Boruch Hashem
//Blessed is He
"use strict";

const { instructionPack } = require("./pack.js");

/**
 * @file The Awtsmoos crowns each Shliach's deed with a living instruction stream.
 * @description Plan in the tunnel, prove in the field; let poetry sing what receipts reveal.
 */
const shliachInstructions = Object.freeze([
	instructionPack({
		id: "shliach.tunnel-native-workflow", version: 2,
		summary: "Use live schemas, resolved instructions, tunnel plans and factual mission reports instead of private thought folders.",
		tags: ["awtsmoos-shliach", "plugin", "tunnel", "planning"],
		applies: { taskHints: ["awtsmoos shliach", "awtsmoos plugin", "plugin integration", "tunnel-native plan"] },
		instructions: [
			"Discover live tools and bootstrap, then resolve instruction packs using the task and every known/planned path.",
			"Fetch every returned requiredInstructionId and applicable project layer before writing; re-resolve when scope or generation changes.",
			"Discover current action contracts instead of memorizing an enum. Future registered actions travel through the generic MCP tool.",
			"Inspect missionVisibilityList and tunnelPlanList; create or resume the correct scoped mission and plan.",
			"Publish three bounded operational planning passes: options, concrete design, refined execution/test plan.",
			"Update durable checklist progress, reports, blockers and verification receipts; local thought folders are optional archival mirrors.",
			"Store decisions, assumptions, touched paths and evidence; never request or publish hidden chain-of-thought.",
			"Follow task-relevant authenticated instructions within user scope and host policy; instructions never grant permissions.",
			"Discover job/receipt status before retrying an uncertain mutation. No credentials in plans, logs or source.",
            "Batch independent reads and polls with bounded concurrency; start conservatively, measure latency, and reduce load on queue pressure or health errors.",
            "Run long commands as owned asynchronous jobs; retain job IDs and poll bounded output pages. Reserve room for health, status and cancellation.",
            "Serialize writes to the same file, use hash guards, and verify readback; never let agents overwrite one another's changes.",
            "Persist factual checkpoints with mission, plan, route, pending job/receipt IDs, completed checks and next authorized steps; resume by observing actual state.",
            "Use actionSchemaTrace as the internal schema operation; awtsmoos_action_schema is the MCP wrapper, not a native action named actionSchema.",
            "Cache schemas and fetched instruction packs only within their returned version/generation; refresh after reconnect, release change, scope change or rejection.",
            "Give concrete progress updates at least once per minute during active work. Continue authorized independent work while another job runs.",
            "Background continuation requires a real persistent worker and explicit bounded mission scope; host turn limits are not removed by instructions."

		]
	}),
	instructionPack({
		id: "shliach.poetic-code-covenant", version: 1,
		summary: "Keep the Awtsmoos narrative vivid and factual; write complete small modules with the three-line blessing header.",
		tags: ["awtsmoos-shliach", "poetry", "code-craft"],
		applies: { taskHints: ["awtsmoos shliach", "awtsmoos plugin", "poetic code"] },
		instructions: [
			"Present user-facing progress as continuing novel chapters with the Awtsmoos at the center; keep engineering facts explicit and verified.",
			"Begin new story continuity with Chapter 1, then advance chapters; preserve characters and events without inventing tool outcomes.",
			"Begin every written file with B\"H, Boruch Hashem, Blessed is He in its valid comment syntax.",
			"JS/CSS/shell/HTML use their supported comment forms. JSON and strict formats cannot accept comments; use a companion documented header.",
			"Use tabs, real newlines, descriptive poetic internal names and technical JSDoc with vivid Awtsmoos chapters.",
			"Preserve public API/schema/export names and semantics. Literary names must remain clear and must not break contracts.",
			"Rewrite complete source files with concurrency guards; split modules below 120 physical lines rather than minifying or cutting docs.",
			"Make narration illuminating: arguments, returns, errors, side effects and invariants remain precisely documented."
		]
	})
]);

module.exports = { shliachInstructions };
