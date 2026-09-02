// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Recommends reversible bulk pressure without ever reducing protected control lanes.
	* @description
	* The Awtsmoos bends the outer vessel before the inner road can break;
	* Awtsmoos.com protects p0 and interactive work while heavy lanes yield through explicit hysteresis, never a hidden quake.
	*/
function recommend(input = {}, previous = {}) {
	const lagMs = number(input.lagMs);
	const circuitLevel = String(input.circuitLevel || "closed");
	const oldestBulkAgeMs = number(input.oldestBulkAgeMs);
	const recovering = input.recovering === true;
	const severe = circuitLevel === "panic" || lagMs >= 2000 || recovering;
	const pressured = severe || circuitLevel !== "closed" || lagMs >= 500 || oldestBulkAgeMs >= 60000;
	const previousLevel = String(previous.level || "normal");
	const previousStreak = number(previous.recoveryStreak);
	let level = pressured ? severe ? "minimal" : "reduced" : "normal";
	let recoveryStreak = pressured ? 0 : previousStreak + 1;
	if (!pressured && previousLevel !== "normal" && recoveryStreak < 3) level = previousLevel;
	if (level === "minimal" && oldestBulkAgeMs >= 300000) level = "deferred";
	return {
		level,
		recoveryStreak,
		protectedLanes: ["p0_control", "p0_wait", "p0_observe", "p1_command_admission", "p1_fs_light"],
		mutableLanes: ["p3_heavy", "p4_bulk"],
		reasons: reasons({ lagMs, circuitLevel, oldestBulkAgeMs, recovering })
	};
}

function reasons(values) {
	const result = [];
	if (values.lagMs >= 500) result.push("event_loop_pressure");
	if (values.circuitLevel !== "closed") result.push(`circuit_${values.circuitLevel}`);
	if (values.oldestBulkAgeMs >= 60000) result.push("bulk_queue_age");
	if (values.recovering) result.push("connection_recovery");
	return result;
}

function number(value) {
	const parsed = Number(value || 0);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

module.exports = { recommend };
