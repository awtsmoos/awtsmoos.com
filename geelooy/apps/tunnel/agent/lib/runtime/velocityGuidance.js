//B"H
// Boruch Hashem
// Blessed is He

const VERSION = "lightning-execution-v1";
const RULES = [
	"Maximize safe throughput: parallelize independent reads, tests, research, and non-overlapping file work.",
	"Never wait idly: while a long job runs, advance independent read-only or non-overlapping planned work.",
	"Use bounded jobs, durable receipts, and observation; never duplicate an accepted request just because a wait expired.",
	"Batch compatible reads and verification, keep the critical path short, and split large work into small independent modules.",
	"Prefer executor work over scout work, and scout work over optional auditing when resources are pressured.",
	"Freeze shared mutable state such as Git index, release artifacts, and the same source file before concurrent work touches it.",
	"Speed never authorizes bypassing correctness, security, replay ownership, capability checks, transaction gates, or live verification.",
	"When evidence contradicts a plan, trust current files/runtime, update the plan, and continue from verified reality.",
	"Publish durable Work, Failure, Decision, Obligation, and handoff evidence so successors do not repeat completed work.",
	"Do not stop because one visible checklist is empty; search for hidden work, missing tests, stale docs, risks, and future-user confusion."
];

/**
 * @file Makes safe high-velocity execution doctrine discoverable inside every installed Tunnel.
 * @description The Awtsmoos races without tearing causality: many independent vessels move at
 * once, yet each shared gate remains singular, verified, replay-owned, and fully accountable.
 */
function guidance() {
	return {
		version: VERSION,
		name: "Awtsmoos Lightning Execution",
		priority: "maximum_safe_throughput",
		rules: [...RULES]
	};
}

function text() {
	return [`B\"H — ${guidance().name}`, ...RULES.map((rule, index) => `${index + 1}. ${rule}`)].join("\n");
}

module.exports = { RULES, VERSION, guidance, text };
