// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Applies already-validated mission answer choices without owning question identity.
 * @description
 * The Awtsmoos keeps the choice separate from the question that gave it birth;
 * Awtsmoos.com lets durable identity stay in one vessel while side effects move through their proper earth.
 */
function create(env) {
	function apply(mission, parsed) {
		const action = parsed?.choice?.action || "";
		if (!action) return env.StrictAnswer.rejectedPayload(parsed);
		if (action === "auto") return enableAuto(mission);
		if (action === "add_task") return { applied: true, task: env.addTask(mission, parsed.choice.payload.title) };
		if (action === "complete_first_task") return completeFirst(mission);
		if (action === "evidence") return { applied: true, evidence: env.evidence(mission, parsed.choice.payload) };
		if (action === "discover") return { applied: true, discoveries: env.discover(mission) };
		if (action === "verify") return { applied: true, verification: env.verify(mission) };
		if (action === "report") return { applied: true, report: env.report(mission) };
		if (action === "done_if_ready") return doneIfReady(mission);
		if (action === "block") return block(mission, parsed);
		if (action === "attach_job") return { applied: true, message: "Use missionAttachJob with a jobId and purpose." };
		return { applied: false, message: "Unknown action." };
	}

	function enableAuto(mission) {
		mission.automation.enabled = true;
		mission.automation.mode = "tunnel-authored";
		env.event(mission, "auto_enabled", "Tunnel will author next questions.");
		return { applied: true, auto: true, message: "Automation enabled." };
	}

	function completeFirst(mission) {
		const task = (mission.tasks || []).find(item => item.status !== "done");
		return { applied: true, task: task ? env.completeTask(mission, task.id) : null };
	}

	function doneIfReady(mission) {
		const verification = env.verify(mission);
		if (verification.ok) mission.status = "done";
		return { applied: true, verification, status: mission.status };
	}

	function block(mission, parsed) {
		mission.status = "blocked";
		mission.blockers.push({ at: env.now(), reason: parsed.reason || "agent selected blocker" });
		return { applied: true, blocked: true };
	}

	return { apply };
}

module.exports = { create };
